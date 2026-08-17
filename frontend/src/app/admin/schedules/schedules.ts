import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Schedule } from './schedules.model';
import { SchedulesService } from './schedules.service';
import { InfoSchedules } from './info-schedules/info-schedules';
import { CreateUpdateSchedules } from './create-update-schedules/create-update-schedules';
import { CreateSchoolDaysBySchedules } from './create-school-days-by-schedules/create-school-days-by-schedules';
import { SchoolDaysBySchedules } from './school-days-by-schedules/school-days-by-schedules';
import { ReportSchedules } from './report-schedules/report-schedules';
import { DeleteSchedules } from './delete-schedules/delete-schedules';
import { DeleteSchoolDaysBySchedule } from './delete-school-days-by-schedule/delete-school-days-by-schedule';

@Component({
  selector: 'app-schedules',
  imports: [FormsModule, InfoSchedules, CreateUpdateSchedules, CreateSchoolDaysBySchedules, SchoolDaysBySchedules, ReportSchedules, DeleteSchedules, DeleteSchoolDaysBySchedule],
  standalone: true,
  templateUrl: './schedules.html',
  styleUrl: './schedules.css',
})
export class Schedules {
  private schedulesService = inject(SchedulesService);

  isReportSchedulesModalOpen = signal(false);

  schedule = signal<Schedule[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  isFormModalOpen = signal(false);
  scheduleToEdit = signal<Schedule | null>(null);

  isInfoModalOpen = signal(false);
  scheduleToView = signal<Schedule | null>(null);

  // Estados para Modal de Generación Masiva de Días Lectivos
  isCreateSchoolDaysModalOpen = signal(false);

  // Estados para Modal de Consulta de Días Lectivos por Horario
  isSchoolDaysModalOpen = signal(false);
  scheduleSelected = signal<Schedule | null>(null);

  constructor() {
    this.fetchSchedule();
  }

  filteredSchedules = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.schedule().filter(sc => {
      const person = sc.teacher_group.academic_staff_contract.academic_staff.personal_information;

      const searchable = [
        person.names,
        person.fathers_surname,
        person.mothers_surname,
        `${person.names} ${person.fathers_surname} ${person.mothers_surname}`,
        person.dni,
        person.email,
        person.phone_number,

        sc.teacher_group.course.course,
        sc.teacher_group.grade.grade,
        sc.teacher_group.section.section,

        sc.day,

        sc.time_slot.time_slot,
        sc.time_slot.start_time,
        sc.time_slot.end_time,

        sc.teacher_group.academic_staff_contract.start_date,
        sc.teacher_group.academic_staff_contract.end_date
      ].join(' ').toLowerCase();

      const matchesSearch =
        !term ||
        searchable.includes(term);

      const matchesYear =
        this.selectedYear() === null ||
        sc.teacher_group.academic_staff_contract.year.id === this.selectedYear();

      const matchesCourse =
        this.selectedCourse() === null ||
        sc.teacher_group.course.id === this.selectedCourse();

      const matchesGrade =
        this.selectedGrade() === null ||
        sc.teacher_group.grade.id === this.selectedGrade();

      const matchesSection =
        this.selectedSection() === null ||
        sc.teacher_group.section.id === this.selectedSection();

      const matchesStaff =
        this.selectedStaffType() === null ||
        sc.teacher_group.academic_staff_contract.academic_staff.staff_type === this.selectedStaffType();

      const matchesTutor =
        this.selectedTutor() === null ||
        sc.teacher_group.tutor === this.selectedTutor();

      const matchesDay =
        this.selectedDay() === null ||
        sc.day === this.selectedDay();

      const matchesTimeSlot =
        this.selectedTimeSlot() === null ||
        sc.time_slot.id === this.selectedTimeSlot();

      return (
        matchesSearch &&
        matchesYear &&
        matchesCourse &&
        matchesGrade &&
        matchesSection &&
        matchesStaff &&
        matchesTutor &&
        matchesDay &&
        matchesTimeSlot
      );
    });
  });

  fetchSchedule(): void {
    this.loading.set(true);
    this.error.set(null);

    this.schedulesService.list().subscribe({
      next: (data) => {
        this.schedule.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los horarios.');
        this.loading.set(false);
      }
    });
  }

  onAdd(): void {
    this.scheduleToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  onEdit(schedule: Schedule): void {
    this.scheduleToEdit.set(schedule);
    this.isFormModalOpen.set(true);
  }

  onCloseFormModal(): void {
    this.scheduleToEdit.set(null);
    this.isFormModalOpen.set(false);
  }

  onSaved(): void {
    this.isFormModalOpen.set(false);
    this.scheduleToEdit.set(null);
    this.fetchSchedule();
  }

  onInfo(schedule: Schedule): void {
    this.scheduleToView.set(schedule);
    this.isInfoModalOpen.set(true);
  }

  onCloseInfoModal(): void {
    this.isInfoModalOpen.set(false);
    this.scheduleToView.set(null);
  }

  // Métodos - Generar Días Lectivos por Año (Modal Global)
  onOpenCreateSchoolDays(): void {
    this.isCreateSchoolDaysModalOpen.set(true);
  }

  onCloseCreateSchoolDays(): void {
    this.isCreateSchoolDaysModalOpen.set(false);
  }

  onSchoolDaysCreated(): void {
    this.isCreateSchoolDaysModalOpen.set(false);
    this.fetchSchedule();
  }

  // Métodos - Consultar Días Lectivos por Horario Específico
  onViewSchoolDays(schedule: Schedule): void {
    this.scheduleSelected.set(schedule);
    this.isSchoolDaysModalOpen.set(true);
  }

  onCloseSchoolDaysModal(): void {
    this.isSchoolDaysModalOpen.set(false);
    this.scheduleSelected.set(null);
  }

  selectedYear = signal<number | null>(null);
  selectedCourse = signal<number | null>(null);
  selectedGrade = signal<number | null>(null);
  selectedSection = signal<number | null>(null);
  selectedStaffType = signal<string | null>(null);
  selectedTutor = signal<boolean | null>(null);
  selectedDay = signal<string | null>(null);
  selectedTimeSlot = signal<number | null>(null);

  courses = computed(() => {
    const courses = this.schedule().map(sc => sc.teacher_group.course);
    return courses.filter(
      (course, index, array) => index === array.findIndex(c => c.id === course.id)
    );
  });

  grades = computed(() => {
    const grades = this.schedule().map(sc => sc.teacher_group.grade);

    return grades.filter(
      (grade, index, array) => index === array.findIndex(g => g.id === grade.id)
    );
  });

  sections = computed(() => {
    const sections = this.schedule().map(sc => sc.teacher_group.section);

    return sections.filter(
      (section, index, array) =>
        index === array.findIndex(s => s.id === section.id)
    );
  });

  staffTypes = computed(() => {
    return [...new Set(
      this.schedule().map(
        sc => sc.teacher_group.academic_staff_contract.academic_staff.staff_type
      )
    )];
  });

  years = computed(() => {
    const years = this.schedule()
      .map(sc => sc.teacher_group.academic_staff_contract.year);

    return years.filter(
      (year, index, array) =>
        index === array.findIndex(y => y.id === year.id)
    );
  });

  days = computed(() => {
    return [...new Set(
      this.schedule().map(sc => sc.day)
    )].sort();
  });

  timeSlots = computed(() => {
    const slots = this.schedule().map(sc => sc.time_slot);

    return slots.filter(
      (slot, index, array) => index === array.findIndex(s => s.id === slot.id)
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
    this.selectedDay.set(null);
    this.selectedTimeSlot.set(null);
  }

  onYearChange(yearId: number | null): void {
    this.selectedYear.set(yearId);
  }

  onOpenReportSchedules(): void {
    this.isReportSchedulesModalOpen.set(true);
  }

  onCloseReportSchedules(): void {
    this.isReportSchedulesModalOpen.set(false);
  }

  isDeleteModalOpen = signal(false);
  scheduleToDelete = signal<Schedule | null>(null);

  onDelete(schedule: Schedule): void {
    this.scheduleToDelete.set(schedule);
    this.isDeleteModalOpen.set(true);
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.scheduleToDelete.set(null);
  }

  onDeleted(): void {
    this.isDeleteModalOpen.set(false);
    this.scheduleToDelete.set(null);
    this.fetchSchedule();
  }

  isDeleteSchoolDaysByScheduleModalOpen = signal(false);

  onOpenDeleteSchoolDaysBySchedule(): void {
    this.isDeleteSchoolDaysByScheduleModalOpen.set(true);
  }

  onCloseDeleteSchoolDaysBySchedule(): void {
    this.isDeleteSchoolDaysByScheduleModalOpen.set(false);
  }

  onSchoolDaysByScheduleDeleted(): void {
    this.isDeleteSchoolDaysByScheduleModalOpen.set(false);
    this.fetchSchedule();
  }

  selectedYearObject = computed(() => {
    const id = this.selectedYear();

    if (id === null) {
      return null;
    }

    return this.years().find(year => year.id === id) ?? null;
  });
}
