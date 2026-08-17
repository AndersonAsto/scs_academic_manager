import { Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { TeacherGroup } from '../teacher-groups.model';
import { TeacherGroupsService } from '../teacher-groups.service';
import { YearService } from '../../years/years.service';
import { CourseService } from '../../courses/courses.service';
import { GradeService } from '../../grades/grades.service';
import { SectionService } from '../../sections/sections.service';
import { AcademicStaffContractsService } from '../../academic-staff/academic-staff-contracts/academic-staff-contracts.service';
import { Year } from '../../years/years.model';
import { AcademicStaffContract } from '../../academic-staff/academic-staff-contracts/academic-staff-contracts.model';
import { Course } from '../../courses/courses.model';
import { Grade } from '../../grades/grades.model';
import { Section } from '../../sections/sections.model';
import { Observable, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-update-teacher-groups',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-update-teacher-groups.html',
  styleUrl: './create-update-teacher-groups.css',
})
export class CreateUpdateTeacherGroups {
  isOpen = input(false);
  teacherGroup = input<TeacherGroup | null>(null);
  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private teacherGroupsService = inject(TeacherGroupsService);
  private yearService = inject(YearService);
  private academicStaffService = inject(AcademicStaffContractsService);
  private courseService = inject(CourseService);
  private gradeService = inject(GradeService);
  private sectionService = inject(SectionService);

  years = signal<Year[]>([]);
  contracts = signal<AcademicStaffContract[]>([]);
  courses = signal<Course[]>([]);
  grades = signal<Grade[]>([]);
  sections = signal<Section[]>([]);

  form = this.fb.group({
    year_id: this.fb.control<number | null>(
      null,
      Validators.required
    ),
    academic_staff_contract_id: this.fb.control<number | null>(
      null,
      Validators.required
    ),
    course_id: this.fb.control<number | null>(
      null,
      Validators.required
    ),
    grade_id: this.fb.control<number | null>(
      null,
      Validators.required
    ),
    section_id: this.fb.control<number | null>(
      null,
      Validators.required
    ),
    tutor: this.fb.nonNullable.control(false),
    description: this.fb.control('')
  });

  contractsByYear = computed(() => {
    const year = Number(this.yearSelected());

    return this.contracts().filter(c =>
      c.year_id === year &&
      c.academic_staff.staff_type === 'Docente'
    );
  });

  constructor() {    
    this.loadYears();
    this.loadContracts();
    this.loadCourses();
    this.loadGrades();
    this.loadSections();

    effect(() => {

      if (!this.isOpen()) return;

      const tg = this.teacherGroup();

      if (!tg) {

        this.form.reset({
          year_id: null,
          academic_staff_contract_id: null,
          course_id: null,
          grade_id: null,
          section_id: null,
          tutor: false,
          description: ''
        });

        this.errorMessage = '';
        return;
      }

      this.form.patchValue({
        year_id: tg.academic_staff_contract.year_id,
        academic_staff_contract_id: tg.academic_staff_contract_id,
        course_id: tg.course_id,
        grade_id: tg.grade_id,
        section_id: tg.section_id,
        tutor: tg.tutor,
        description: tg.description ?? ''
      });

      this.errorMessage = '';

    });

  }

  get isEditMode(): boolean {
    return !!this.teacherGroup();
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {
      academic_staff_contract_id: this.form.value.academic_staff_contract_id!,
      course_id: this.form.value.course_id!,
      grade_id: this.form.value.grade_id!,
      section_id: this.form.value.section_id!,
      tutor: this.form.value.tutor!,
      description: this.form.value.description?.trim() || null
    };

    const teacherGroup = this.teacherGroup();

    const request$: Observable<unknown> = this.isEditMode
      ? this.teacherGroupsService.update(this.teacherGroup()!.id, payload)
      : this.teacherGroupsService.create(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.saved.emit();
      },

      error: err => {
        this.submitting = false;
        this.errorMessage =
          err?.error?.message ??
          'Ocurrió un error. Inténtalo nuevamente.';
      }
    });

  }

  private loadYears(): void {
    this.yearService.list().subscribe({
      next: data => this.years.set(data)
    });
  }

  private loadContracts(): void {
    this.academicStaffService.list().subscribe({
      next: data => {
        console.table(
          data.map(c => ({
            contract: c.id,
            year_id: c.year_id,
            year: c.year.year,
            docente:
              c.academic_staff.personal_information.names +
              ' ' +
              c.academic_staff.personal_information.fathers_surname,
            tipo: c.academic_staff.staff_type
          }))
        );

        this.contracts.set(data);
      }
    });
  }

  private loadCourses(): void {
    this.courseService.list().subscribe({
      next: data => this.courses.set(data)
    });
  }

  private loadGrades(): void {
    this.gradeService.list().subscribe({
      next: data => this.grades.set(data)
    });
  }

  private loadSections(): void {
    this.sectionService.list().subscribe({
      next: data => this.sections.set(data)
    });
  }

  onYearChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);

    this.form.patchValue({
      year_id: value,
      academic_staff_contract_id: null
    });
  }

  getContractName(contract: AcademicStaffContract): string {
    const p = contract.academic_staff.personal_information;
    return `${p.names} ${p.fathers_surname} ${p.mothers_surname}`;
  }

  yearSelected = toSignal(
    this.form.controls.year_id.valueChanges.pipe(
      startWith(this.form.controls.year_id.value)
    )
  );
}
