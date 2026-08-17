import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AnnouncementsService } from './ads-sent.service';
import { Announcement, GroupedAnnouncements } from './ads-sent.model';
import { CreateAdsSent } from './create-ads-sent/create-ads-sent';
import { InfoAdsSent } from './info-ads-sent/info-ads-sent';

@Component({
  selector: 'app-ads-sent',
  standalone: true,
  imports: [
    FormsModule,
    CreateAdsSent,
    InfoAdsSent,
    DatePipe
  ],
  templateUrl: './ads-sent.html',
  styleUrl: './ads-sent.css',
})
export class AdsSent {

  private announcementsService = inject(AnnouncementsService);

  announcements = signal<Announcement[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = signal('');

  selectedCourseId = signal<number | null>(null);
  selectedGradeId = signal<number | null>(null);
  selectedSectionId = signal<number | null>(null);

  isFormModalOpen = signal(false);
  isInfoModalOpen = signal(false);

  groupToView = signal<GroupedAnnouncements | null>(null);

  constructor() {
    this.fetchAnnouncements();
  }

  fetchAnnouncements(
    keepRegistrationId: number | null = null
  ): void {

    this.loading.set(true);
    this.error.set(null);

    this.announcementsService.list().subscribe({
      next: (data) => {

        this.announcements.set(data);
        this.loading.set(false);

        if (keepRegistrationId === null) {
          return;
        }

        const updatedGroup = this.groupedAnnouncements()
          .find(group =>
            group.registration_id === keepRegistrationId
          );

        if (updatedGroup) {
          this.groupToView.set(updatedGroup);
        } else {
          this.onCloseInfoModal();
        }
      },

      error: () => {
        this.error.set('No se han podido cargar los comunicados.');
        this.loading.set(false);
      }
    });
  }

  groupedAnnouncements = computed<GroupedAnnouncements[]>(() => {

    const map = new Map<number, GroupedAnnouncements>();

    for (const a of this.announcements()) {

      const reg = a.registration;

      if (!reg) continue;

      const teacherGroup = a.teacher_group;

      if (!teacherGroup) continue;

      if (!map.has(a.registration_id)) {

        map.set(a.registration_id, {

          registration_id: a.registration_id,

          student_name:
            `${reg.student.personal_information.names} ` +
            `${reg.student.personal_information.fathers_surname} ` +
            `${reg.student.personal_information.mothers_surname}`,

          parent_name:
            `${reg.parent.personal_information.names} ` +
            `${reg.parent.personal_information.fathers_surname} ` +
            `${reg.parent.personal_information.mothers_surname}`,

          course_id: teacherGroup.course_id,
          grade_id: teacherGroup.grade_id,
          section_id: teacherGroup.section_id,

          count: 0,
          unread_count: 0,
          last_date: a.registration_date,
          announcements: []
        });
      }

      const group = map.get(a.registration_id)!;

      group.count++;

      if (!a.reading) {
        group.unread_count++;
      }

      if (
        new Date(a.registration_date) >
        new Date(group.last_date)
      ) {
        group.last_date = a.registration_date;
      }

      group.announcements.push(a);
    }

    return Array.from(map.values());
  });

  courses = computed(() => {

    const map = new Map<number, { id: number; course: string }>();

    for (const announcement of this.announcements()) {

      const course = announcement.teacher_group?.course;

      if (!course) continue;

      if (!map.has(course.id)) {
        map.set(course.id, course);
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.course.localeCompare(b.course)
    );
  });

  grades = computed(() => {

    const courseId = this.selectedCourseId();

    const map = new Map<number, { id: number; grade: string }>();

    for (const announcement of this.announcements()) {

      const teacherGroup = announcement.teacher_group;

      if (!teacherGroup) continue;

      if (
        courseId !== null &&
        teacherGroup.course_id !== courseId
      ) {
        continue;
      }

      const grade = teacherGroup.grade;

      if (!grade) continue;

      if (!map.has(grade.id)) {
        map.set(grade.id, grade);
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.grade.localeCompare(b.grade)
    );
  });

  sections = computed(() => {

    const courseId = this.selectedCourseId();
    const gradeId = this.selectedGradeId();

    const map = new Map<number, { id: number; section: string }>();

    for (const announcement of this.announcements()) {

      const teacherGroup = announcement.teacher_group;

      if (!teacherGroup) continue;

      if (
        courseId !== null &&
        teacherGroup.course_id !== courseId
      ) {
        continue;
      }

      if (
        gradeId !== null &&
        teacherGroup.grade_id !== gradeId
      ) {
        continue;
      }

      const section = teacherGroup.section;

      if (!section) continue;

      if (!map.has(section.id)) {
        map.set(section.id, section);
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.section.localeCompare(b.section)
    );
  });

  filteredGroups = computed(() => {

    const term = this.searchTerm()
      .toLowerCase()
      .trim();

    const courseId = this.selectedCourseId();
    const gradeId = this.selectedGradeId();
    const sectionId = this.selectedSectionId();

    return this.groupedAnnouncements().filter(group => {

      const matchesSearch =
        !term ||
        `${group.student_name} ${group.parent_name}`
          .toLowerCase()
          .includes(term);

      const matchesCourse =
        courseId === null ||
        group.course_id === courseId;

      const matchesGrade =
        gradeId === null ||
        group.grade_id === gradeId;

      const matchesSection =
        sectionId === null ||
        group.section_id === sectionId;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesGrade &&
        matchesSection
      );
    });
  });

  onCourseChange(courseId: number | null): void {

    this.selectedCourseId.set(courseId);

    this.selectedGradeId.set(null);
    this.selectedSectionId.set(null);
  }

  onGradeChange(gradeId: number | null): void {

    this.selectedGradeId.set(gradeId);

    this.selectedSectionId.set(null);
  }

  onSectionChange(sectionId: number | null): void {
    this.selectedSectionId.set(sectionId);
  }

  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedCourseId.set(null);
    this.selectedGradeId.set(null);
    this.selectedSectionId.set(null);
  }

  onAdd(): void {
    this.isFormModalOpen.set(true);
  }

  onCloseFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  onSaved(): void {
    this.isFormModalOpen.set(false);
    this.fetchAnnouncements();
  }

  onInfo(group: GroupedAnnouncements): void {
    this.groupToView.set(group);
    this.isInfoModalOpen.set(true);
  }

  onCloseInfoModal(): void {
    this.isInfoModalOpen.set(false);
    this.groupToView.set(null);
  }

  onAnnouncementUpdated(announcement: Announcement): void {

    const currentGroup = this.groupToView();

    this.fetchAnnouncements(
      currentGroup?.registration_id ?? null
    );
  }

  onAnnouncementDeleted(): void {

    const currentGroup = this.groupToView();

    this.fetchAnnouncements(
      currentGroup?.registration_id ?? null
    );
  }
}