import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  AdsReceivedService,
  Announcement,
  ChildRegistration
} from './ads-received.service';

import { InfoAdsReceived } from './info-ads-received/info-ads-received';
import { DatePipe } from '@angular/common';

type ReadingFilter = 'all' | 'unread' | 'read';
type SortOrder = 'newest' | 'oldest';

@Component({
  selector: 'app-ads-received',
  standalone: true,
  imports: [
    DatePipe,
    InfoAdsReceived
  ],
  templateUrl: './ads-received.html',
  styleUrl: './ads-received.css',
})
export class AdsReceived {

  private service = inject(AdsReceivedService);

  children = signal<ChildRegistration[]>([]);
  announcements = signal<Announcement[]>([]);

  selectedYearId = signal<number | null>(null);
  selectedRegistrationId = signal<number | null>(null);

  loadingChildren = signal(false);
  loadingAnnouncements = signal(false);

  error = signal<string | null>(null);

  selectedType = signal<string | null>(null);
  selectedPriority = signal<string | null>(null);

  readingFilter = signal<ReadingFilter>('all');
  sortOrder = signal<SortOrder>('newest');

  selectedAnnouncement = signal<Announcement | null>(null);
  isInfoModalOpen = signal(false);

  constructor() {
    this.loadChildren();
  }

  async loadChildren(): Promise<void> {

    this.loadingChildren.set(true);
    this.error.set(null);

    try {

      const children = await this.service.getMyChildren();

      this.children.set(children);

    } catch (error) {

      console.error(error);

      this.error.set(
        'No se han podido cargar los estudiantes registrados.'
      );

    } finally {

      this.loadingChildren.set(false);
    }
  }

  /*
   * Años disponibles según las matrículas
   */
  years = computed(() => {

    const map = new Map<number, number>();

    for (const child of this.children()) {
      map.set(child.year_id, child.year);
    }

    return Array.from(map.entries())
      .map(([year_id, year]) => ({
        year_id,
        year
      }))
      .sort((a, b) => b.year - a.year);
  });

  /*
   * Matrículas correspondientes al año seleccionado
   */
  childrenForSelectedYear = computed(() => {

    const yearId = this.selectedYearId();

    if (yearId === null) {
      return [];
    }

    return this.children()
      .filter(child => child.year_id === yearId)
      .sort((a, b) => {

        const surnameA =
          `${a.fathers_surname} ${a.mothers_surname} ${a.names}`;

        const surnameB =
          `${b.fathers_surname} ${b.mothers_surname} ${b.names}`;

        return surnameA.localeCompare(surnameB);
      });
  });

  selectedChild = computed(() => {

    const registrationId = this.selectedRegistrationId();

    if (registrationId === null) {
      return null;
    }

    return this.children().find(
      child => child.registration_id === registrationId
    ) ?? null;
  });

  availableTypes = computed(() => {

    const types = new Set<string>();

    for (const announcement of this.announcements()) {

      if (announcement.status && announcement.type) {
        types.add(announcement.type);
      }
    }

    return Array.from(types).sort();
  });

  availablePriorities = computed(() => {

    const priorities = new Set<string>();

    for (const announcement of this.announcements()) {

      if (
        announcement.status &&
        announcement.priority
      ) {
        priorities.add(announcement.priority);
      }
    }

    return Array.from(priorities).sort();
  });

  unreadCount = computed(() => {

    return this.announcements()
      .filter(a => a.status && !a.reading)
      .length;
  });

  filteredAnnouncements = computed(() => {

    const type = this.selectedType();
    const priority = this.selectedPriority();
    const reading = this.readingFilter();
    const sortOrder = this.sortOrder();

    let result = this.announcements()
      .filter(a => a.status);

    if (type !== null) {

      result = result.filter(
        a => a.type === type
      );
    }

    if (priority !== null) {

      result = result.filter(
        a => a.priority === priority
      );
    }

    if (reading === 'unread') {

      result = result.filter(
        a => !a.reading
      );

    } else if (reading === 'read') {

      result = result.filter(
        a => a.reading
      );
    }

    result = [...result].sort((a, b) => {

      const dateA =
        new Date(a.registration_date).getTime();

      const dateB =
        new Date(b.registration_date).getTime();

      return sortOrder === 'newest'
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  });

  /*
   * Cambio de año.
   *
   * No cargamos comunicados aquí porque todavía
   * no se ha seleccionado una matrícula.
   */
  onYearChange(yearId: number): void {

    this.selectedYearId.set(yearId);

    this.selectedRegistrationId.set(null);

    this.announcements.set([]);

    this.resetAnnouncementFilters();

    this.closeInfoWithoutReload();
  }

  /*
   * Cambio de estudiante/matrícula.
   */
  async onChildChange(
    registrationId: number
  ): Promise<void> {

    this.selectedRegistrationId.set(registrationId);

    this.resetAnnouncementFilters();

    this.selectedAnnouncement.set(null);
    this.isInfoModalOpen.set(false);

    this.loadingAnnouncements.set(true);
    this.error.set(null);

    try {

      const announcements =
        await this.service.getAnnouncements(registrationId);

      this.announcements.set(announcements);

    } catch (error) {

      console.error(error);

      this.announcements.set([]);

      this.error.set(
        'No se han podido cargar los comunicados.'
      );

    } finally {

      this.loadingAnnouncements.set(false);
    }
  }

  onTypeChange(type: string): void {

    this.selectedType.set(
      type || null
    );
  }

  onPriorityChange(priority: string): void {

    this.selectedPriority.set(
      priority || null
    );
  }

  onReadingChange(value: string): void {

    this.readingFilter.set(
      value as ReadingFilter
    );
  }

  onSortChange(value: string): void {

    this.sortOrder.set(
      value as SortOrder
    );
  }

  clearFilters(): void {

    this.resetAnnouncementFilters();
  }

  private resetAnnouncementFilters(): void {

    this.selectedType.set(null);
    this.selectedPriority.set(null);
    this.readingFilter.set('all');
    this.sortOrder.set('newest');
  }

  async onInfo(
    announcement: Announcement
  ): Promise<void> {

    this.selectedAnnouncement.set(announcement);
    this.isInfoModalOpen.set(true);

    if (!announcement.reading) {

      try {

        const updated =
          await this.service.markAsRead(
            announcement.id
          );

        this.announcements.update(
          announcements =>
            announcements.map(a =>
              a.id === updated.id
                ? {
                    ...a,
                    ...updated,
                    reading: true
                  }
                : a
            )
        );

        this.selectedAnnouncement.set({
          ...announcement,
          ...updated,
          reading: true
        });

      } catch (error) {

        console.error(
          'No se pudo marcar el comunicado como leído.',
          error
        );
      }
    }
  }

  onCloseInfo(): void {

    this.isInfoModalOpen.set(false);
    this.selectedAnnouncement.set(null);
  }

  private closeInfoWithoutReload(): void {

    this.isInfoModalOpen.set(false);
    this.selectedAnnouncement.set(null);
  }
}