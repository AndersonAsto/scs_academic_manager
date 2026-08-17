import {
  Component, effect, inject, input, output, signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  RegistrationsService,
  SaveRegistrationPayload,
  UpdateRegistrationPayload
} from '../registrations.service';
import { Registration } from '../registration.model';

import { YearService } from '../../years/years.service';
import { GradeService } from '../../grades/grades.service';
import { SectionService } from '../../sections/sections.service';
import { ParentsService } from '../parents/parents.service';
import { StudentsService } from '../students/students.service';

@Component({
  selector: 'app-create-update-registration',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-update-registration.html',
  styleUrl: './create-update-registration.css',
})
export class CreateUpdateRegistration {

  isOpen = input(false);
  registration = input<Registration | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private registrationsService = inject(RegistrationsService);
  private yearsService = inject(YearService);
  private gradesService = inject(GradeService);
  private sectionsService = inject(SectionService);
  private parentsService = inject(ParentsService);
  private studentsService = inject(StudentsService);

  years = signal<any[]>([]);
  grades = signal<any[]>([]);
  sections = signal<any[]>([]);
  parentsList = signal<any[]>([]);
  studentsList = signal<any[]>([]);

  isExistingStudent = signal(false);
  isExistingParent = signal(false);

  form = this.fb.group({

    year_id: this.fb.control<number | null>(null, Validators.required),
    grade_id: this.fb.control<number | null>(null, Validators.required),
    section_id: this.fb.control<number | null>(null, Validators.required),
    registration_date: this.fb.control('', Validators.required),
    description: this.fb.control(''),

    // estudiante (solo creación)
    student_id: this.fb.control<number | null>(null),
    student_names: this.fb.control(''),
    student_fathers_surname: this.fb.control(''),
    student_mothers_surname: this.fb.control(''),
    student_dni: this.fb.control(''),
    student_email: this.fb.control(''),
    student_phone_number: this.fb.control(''),
    student_address: this.fb.control(''),
    student_district: this.fb.control(''),
    student_province: this.fb.control(''),
    student_department: this.fb.control(''),
    student_gender: this.fb.control(''),

    // apoderado (creación: nuevo o existente / edición: solo reasignar)
    parent_id: this.fb.control<number | null>(null),
    parent_names: this.fb.control(''),
    parent_fathers_surname: this.fb.control(''),
    parent_mothers_surname: this.fb.control(''),
    parent_dni: this.fb.control(''),
    parent_email: this.fb.control(''),
    parent_phone_number: this.fb.control(''),
    parent_address: this.fb.control(''),
    parent_district: this.fb.control(''),
    parent_province: this.fb.control(''),
    parent_department: this.fb.control(''),
    parent_gender: this.fb.control(''),
  });

  get isEditMode(): boolean {
    return !!this.registration();
  }

  constructor() {

    effect(() => {

      if (!this.isOpen()) return;

      this.yearsService.list().subscribe({ next: d => this.years.set(d) });
      this.gradesService.list().subscribe({ next: d => this.grades.set(d) });
      this.sectionsService.list().subscribe({ next: d => this.sections.set(d) });
      this.parentsService.list().subscribe({ next: d => this.parentsList.set(d) });

      const reg = this.registration();

      if (!reg) {

        this.isExistingStudent.set(false);
        this.isExistingParent.set(false);

        this.studentsService.list().subscribe({ next: d => this.studentsList.set(d) });

        this.form.reset({
          year_id: null,
          grade_id: null,
          section_id: null,
          registration_date: '',
          description: '',
          student_id: null,
          student_names: '',
          student_fathers_surname: '',
          student_mothers_surname: '',
          student_dni: '',
          student_email: '',
          student_phone_number: '',
          student_address: '',
          student_district: '',
          student_province: '',
          student_department: '',
          student_gender: '',
          parent_id: null,
          parent_names: '',
          parent_fathers_surname: '',
          parent_mothers_surname: '',
          parent_dni: '',
          parent_email: '',
          parent_phone_number: '',
          parent_address: '',
          parent_district: '',
          parent_province: '',
          parent_department: '',
          parent_gender: ''
        });

        this.form.get('student_id')?.enable();
        this.errorMessage = '';
        return;
      }

      this.form.patchValue({
        year_id: reg.year_id,
        grade_id: reg.grade_id,
        section_id: reg.section_id,
        registration_date: reg.registration_date,
        description: reg.description ?? '',
        student_id: reg.student_id,
        parent_id: reg.parent_id
      });

      this.form.get('student_id')?.disable();
      this.errorMessage = '';

    });

  }

  onStudentSelected(id: number): void {
    this.form.patchValue({ student_id: id });
  }

  onParentSelected(id: number): void {
    this.form.patchValue({ parent_id: id });
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isEditMode) {

      if (this.isExistingStudent() && !this.form.value.student_id) {
        this.errorMessage = 'Seleccione un estudiante.';
        return;
      }
      if (!this.isExistingStudent() &&
        (!this.form.value.student_dni || !this.form.value.student_email || !this.form.value.student_phone_number)) {
        this.errorMessage = 'Complete los datos obligatorios del nuevo estudiante.';
        return;
      }
      if (this.isExistingParent() && !this.form.value.parent_id) {
        this.errorMessage = 'Seleccione un apoderado.';
        return;
      }
      if (!this.isExistingParent() &&
        (!this.form.value.parent_dni || !this.form.value.parent_email || !this.form.value.parent_phone_number)) {
        this.errorMessage = 'Complete los datos obligatorios del nuevo apoderado.';
        return;
      }
    } else if (!this.form.value.parent_id) {
      this.errorMessage = 'Seleccione un apoderado.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    let request$: Observable<unknown>;

    if (this.isEditMode) {

      const payload: UpdateRegistrationPayload = {
        year_id: this.form.value.year_id!,
        grade_id: this.form.value.grade_id!,
        section_id: this.form.value.section_id!,
        parent_id: this.form.value.parent_id!,
        registration_date: this.form.value.registration_date!,
        description: this.form.value.description?.trim() || null
      };

      request$ = this.registrationsService.update(this.registration()!.id, payload);

    } else {

      const payload: SaveRegistrationPayload = {
        year_id: this.form.value.year_id!,
        grade_id: this.form.value.grade_id!,
        section_id: this.form.value.section_id!,
        registration_date: this.form.value.registration_date!,
        description: this.form.value.description?.trim() || null
      };

      if (this.isExistingStudent()) {
        payload.student_id = this.form.value.student_id!;
      } else {
        payload.student = {
          names: this.form.value.student_names!,
          fathers_surname: this.form.value.student_fathers_surname!,
          mothers_surname: this.form.value.student_mothers_surname!,
          dni: this.form.value.student_dni!,
          email: this.form.value.student_email!,
          phone_number: this.form.value.student_phone_number!,
          address: this.form.value.student_address || null,
          district: this.form.value.student_district || null,
          province: this.form.value.student_province || null,
          department: this.form.value.student_department || null,
          gender: this.form.value.student_gender || null
        };
      }

      if (this.isExistingParent()) {
        payload.parent_id = this.form.value.parent_id!;
      } else {
        payload.parent = {
          names: this.form.value.parent_names!,
          fathers_surname: this.form.value.parent_fathers_surname!,
          mothers_surname: this.form.value.parent_mothers_surname!,
          dni: this.form.value.parent_dni!,
          email: this.form.value.parent_email!,
          phone_number: this.form.value.parent_phone_number!,
          address: this.form.value.parent_address || null,
          district: this.form.value.parent_district || null,
          province: this.form.value.parent_province || null,
          department: this.form.value.parent_department || null,
          gender: this.form.value.parent_gender || null
        };
      }

      request$ = this.registrationsService.create(payload);
    }

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.saved.emit();
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = err?.error?.message ?? 'Ocurrió un error. Inténtalo nuevamente.';
      }
    });

  }

}