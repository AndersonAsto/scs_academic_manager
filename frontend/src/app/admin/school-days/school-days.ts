import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchoolDay } from './school-days.model';
import { SchoolDaysService } from './school-days.service';
import { InfoSchoolDays } from './info-school-days/info-school-days';
import { CreateSchoolDays } from './create-school-days/create-school-days';
import { UpdateSchoolDays } from './update-school-days/update-school-days';
import { DeleteSchoolDays } from './delete-school-days/delete-school-days';

@Component({
  selector: 'app-school-days',
  imports: [FormsModule, InfoSchoolDays, CreateSchoolDays, UpdateSchoolDays, DeleteSchoolDays],
  standalone: true,
  templateUrl: './school-days.html',
  styleUrl: './school-days.css',
})
export class SchoolDays {
  private schoolDaysService = inject(SchoolDaysService);

  schoolDay = signal<SchoolDay[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  isCreateModalOpen = signal(false);
  isUpdateModalOpen = signal(false);
  schoolDayToEdit = signal<SchoolDay | null>(null);

  isInfoModalOpen = signal(false);
  schoolDayToView = signal<SchoolDay | null>(null);

  constructor() {
    this.fetchSchoolDays();
  }

  filteredSchoolDays = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const year = this.selectedYear();
    const block = this.selectedTeachingBlock();

    return this.schoolDay().filter(sd => {
      const matchesSearch =
        !term ||
        sd.school_day.toLowerCase().includes(term) ||
        sd.day.toLowerCase().includes(term) ||
        sd.type.toLowerCase().includes(term) ||
        sd.week_number.toString().includes(term);

      const matchesYear =
        year === null ||
        sd.teaching_block.year.id === year;

      const matchesBlock =
        block === null ||
        sd.teaching_block.id === block;

      return matchesSearch &&
        matchesYear &&
        matchesBlock;
    });
  });

  fetchSchoolDays(): void {
    this.loading.set(true);
    this.error.set(null);

    this.schoolDaysService.list().subscribe({
      next: (data) => {
        this.schoolDay.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los bloques lectivos.');
        this.loading.set(false);
      }
    });
  }

  onAdd(): void {
    this.isCreateModalOpen.set(true);
  }

  onEdit(schoolDay: SchoolDay): void {
    this.schoolDayToEdit.set(schoolDay);
    this.isUpdateModalOpen.set(true);
  }

  onCloseCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onCloseUpdateModal(): void {
    this.schoolDayToEdit.set(null);
    this.isUpdateModalOpen.set(false);
  }

  onSaved(): void {
    this.isCreateModalOpen.set(false);
    this.isUpdateModalOpen.set(false);
    this.schoolDayToEdit.set(null);
    this.fetchSchoolDays();
  }

  onInfo(schoolDay: SchoolDay): void {
    this.schoolDayToView.set(schoolDay);
    this.isInfoModalOpen.set(true);
  }

  onCloseInfoModal(): void {
    this.isInfoModalOpen.set(false);
    this.schoolDayToView.set(null);
  }

  years = computed(() => {
    const years = this.schoolDay()
      .map(sd => sd.teaching_block.year);
    return years.filter(
      (year, index, array) =>
        index === array.findIndex(y => y.id === year.id)
    );
  });

  teachingBlocks = computed(() => {
    const selectedYear = this.selectedYear();

    let blocks = this.schoolDay()
      .map(sd => sd.teaching_block);

    if (selectedYear !== null) {
      blocks = blocks.filter(
        block => block.year.id === selectedYear
      );
    }

    return blocks.filter(
      (block, index, array) =>
        index === array.findIndex(b => b.id === block.id)
    );
  });

  selectedYear = signal<number | null>(null);
  selectedTeachingBlock = signal<number | null>(null);

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedYear.set(null);
    this.selectedTeachingBlock.set(null);
  }

  onYearChange(yearId: number | null): void {
    this.selectedYear.set(yearId);
    this.selectedTeachingBlock.set(null);
  }

  isDeleteModalOpen = signal(false);
  yearToDelete = signal<number | null>(null);

  onDelete(): void {

    const yearId = this.selectedYear();

    if (yearId === null) {
      return;
    }

    this.yearToDelete.set(yearId);
    this.isDeleteModalOpen.set(true);
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.yearToDelete.set(null);
  }

  onDeleted(): void {
    this.isDeleteModalOpen.set(false);
    this.yearToDelete.set(null);

    this.selectedYear.set(null);
    this.selectedTeachingBlock.set(null);

    this.fetchSchoolDays();
  }

  selectedYearObject = computed(() => {
    const id = this.selectedYear();
    if (id === null) return null;

    return this.years().find(y => y.id === id) ?? null;
  });
}
