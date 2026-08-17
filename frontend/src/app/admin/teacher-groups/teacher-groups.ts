import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TeacherGroup } from './teacher-groups.model';
import { TeacherGroupsService } from './teacher-groups.service';
import { InfoTeacherGroups } from './info-teacher-groups/info-teacher-groups';
import { CreateUpdateTeacherGroups } from './create-update-teacher-groups/create-update-teacher-groups';
import { DeleteTeacherGroups } from './delete-teacher-groups/delete-teacher-groups';

@Component({
  selector: 'app-teacher-groups',
  imports: [FormsModule, InfoTeacherGroups, CreateUpdateTeacherGroups, DeleteTeacherGroups],
  templateUrl: './teacher-groups.html',
  styleUrl: './teacher-groups.css',
})
export class TeacherGroups {
  private teacherGroupsService = inject(TeacherGroupsService);

  teacherGroup = signal<TeacherGroup[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  isFormModalOpen = signal(false);
  teacherGroupToEdit = signal<TeacherGroup | null>(null);

  isInfoModalOpen = signal(false);
  teacherGroupToView = signal<TeacherGroup | null>(null);

  constructor() {
    this.fetchTeacherGroups();
  }

  filteredTeacherGroups = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.teacherGroup().filter(tg => {
      const person = tg.academic_staff_contract.academic_staff.personal_information;

      const searchable = [
        person.names,
        person.fathers_surname,
        person.mothers_surname,
        `${person.names} ${person.fathers_surname} ${person.mothers_surname}`,
        person.dni,
        person.email,
        person.phone_number,
        tg.academic_staff_contract.start_date,
        tg.academic_staff_contract.end_date
      ].join(' ').toLowerCase();

      const matchesSearch =
        !term ||
        searchable.includes(term);

      const matchesYear =
        this.selectedYear() === null ||
        tg.academic_staff_contract.year.id === this.selectedYear();

      const matchesCourse =
        this.selectedCourse() === null ||
        tg.course.id === this.selectedCourse();

      const matchesGrade =
        this.selectedGrade() === null ||
        tg.grade.id === this.selectedGrade();

      const matchesSection =
        this.selectedSection() === null ||
        tg.section.id === this.selectedSection();

      const matchesStaff =
        this.selectedStaffType() === null ||
        tg.academic_staff_contract.academic_staff.staff_type === this.selectedStaffType();

      const matchesTutor =
        this.selectedTutor() === null ||
        tg.tutor === this.selectedTutor();

      return (
        matchesSearch &&
        matchesYear &&
        matchesCourse &&
        matchesGrade &&
        matchesSection &&
        matchesStaff &&
        matchesTutor
      );
    });
  });

  fetchTeacherGroups(): void {
    this.loading.set(true);
    this.error.set(null);

    this.teacherGroupsService.list().subscribe({
      next: (data) => {
        this.teacherGroup.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los grupos de docentes.');
        this.loading.set(false);
      }
    });
  }

  onAdd(): void {
    this.teacherGroupToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  onEdit(teacherGroup: TeacherGroup): void {
    this.teacherGroupToEdit.set(teacherGroup);
    this.isFormModalOpen.set(true);
  }

  onCloseFormModal(): void {
    this.teacherGroupToEdit.set(null);
    this.isFormModalOpen.set(false);
  }

  onSaved(): void {
    this.isFormModalOpen.set(false);
    this.teacherGroupToEdit.set(null);
    this.fetchTeacherGroups();
  }

  onInfo(teacherGroup: TeacherGroup): void {
    this.teacherGroupToView.set(teacherGroup);
    this.isInfoModalOpen.set(true);
  }

  onCloseInfoModal(): void {
    this.isInfoModalOpen.set(false);
    this.teacherGroupToView.set(null);
  }

  selectedYear = signal<number | null>(null);
  selectedCourse = signal<number | null>(null);
  selectedGrade = signal<number | null>(null);
  selectedSection = signal<number | null>(null);
  selectedStaffType = signal<string | null>(null);
  selectedTutor = signal<boolean | null>(null);

  courses = computed(() => {
    const courses = this.teacherGroup().map(tg => tg.course);
    return courses.filter(
      (course, index, array) => index === array.findIndex(c => c.id === course.id)
    );
  });

  grades = computed(() => {
    const grades = this.teacherGroup().map(tg => tg.grade);

    return grades.filter(
      (grade, index, array) => index === array.findIndex(g => g.id === grade.id)
    );
  });

  sections = computed(() => {
    const sections = this.teacherGroup().map(tg => tg.section);

    return sections.filter(
      (section, index, array) =>
        index === array.findIndex(s => s.id === section.id)
    );
  });

  staffTypes = computed(() => {
    return [...new Set(
      this.teacherGroup().map(
        tg => tg.academic_staff_contract.academic_staff.staff_type
      )
    )];
  });

  years = computed(() => {

    const years = this.teacherGroup()
      .map(tg => tg.academic_staff_contract.year);

    return years.filter(
      (year, index, array) =>
        index === array.findIndex(y => y.id === year.id)
    );

  });

  clearFilters(): void {
    this.searchTerm.set('');

    this.selectedYear.set(null);
    this.selectedCourse.set(null);
    this.selectedGrade.set(null);
    this.selectedSection.set(null);
    this.selectedStaffType.set(null);
    this.selectedTutor.set(null);
  }

  onYearChange(yearId: number | null): void {
    this.selectedYear.set(yearId);
  }

  isDeleteModalOpen = signal(false);
  teacherGroupToDelete = signal<TeacherGroup | null>(null);

  onDelete(teacherGroup: TeacherGroup): void {
    this.teacherGroupToDelete.set(teacherGroup);
    this.isDeleteModalOpen.set(true);
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.teacherGroupToDelete.set(null);
  }

  onDeleted(): void {
    this.isDeleteModalOpen.set(false);
    this.teacherGroupToDelete.set(null);

    this.fetchTeacherGroups();
  }
}
