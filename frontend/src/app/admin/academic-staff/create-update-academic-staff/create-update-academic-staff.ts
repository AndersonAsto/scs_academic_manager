import {
  Component,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Observable } from 'rxjs';

import {
  AcademicStaffService,
  SaveAcademicStaffPayload,
  UpdateAcademicStaffPayload
} from '../academic-staff.service';

import { AcademicStaffModel } from '../academic-staff.model';

@Component({
  selector: 'app-create-update-academic-staff',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-update-academic-staff.html',
  styleUrl: './create-update-academic-staff.css',
})
export class CreateUpdateAcademicStaff {

  isOpen = input(false);

  academicStaff = input<AcademicStaffModel | null>(null);

  closeModal = output<void>();

  saved = output<void>();

  submitting = false;

  errorMessage = '';

  private fb = inject(FormBuilder);

  private academicStaffService =
    inject(AcademicStaffService);

  academicStaffList =
    signal<AcademicStaffModel[]>([]);

  isExistingPerson =
    signal(false);

  form = this.fb.group({

    academic_staff_id:
      this.fb.control<number | null>(null),

    names:
      this.fb.control('', Validators.required),

    fathers_surname:
      this.fb.control('', Validators.required),

    mothers_surname:
      this.fb.control('', Validators.required),

    dni:
      this.fb.control('', Validators.required),

    email:
      this.fb.control(''),

    phone_number:
      this.fb.control('', Validators.required),

    address:
      this.fb.control(''),

    district:
      this.fb.control(''),

    province:
      this.fb.control(''),

    department:
      this.fb.control(''),

    gender:
      this.fb.control(''),

    role:
      this.fb.control('', Validators.required),

    position:
      this.fb.control('', Validators.required),

    start_date:
      this.fb.control('', Validators.required),

    end_date:
      this.fb.control('', Validators.required),

    description:
      this.fb.control('')
  });

  constructor() {

    effect(() => {

      if (!this.isOpen()) return;

      const staff = this.academicStaff();

      const contractFields = ['position', 'start_date', 'end_date'];

      if (!staff) {

        this.loadAcademicStaff();

        contractFields.forEach(f =>
          this.form.get(f)?.setValidators(Validators.required)
        );

        this.isExistingPerson.set(false); // ← movido aquí

        this.form.reset({
          academic_staff_id: null,
          names: '',
          fathers_surname: '',
          mothers_surname: '',
          dni: '',
          email: '',
          phone_number: '',
          address: '',
          district: '',
          province: '',
          department: '',
          gender: '',
          role: '',
          position: '',
          start_date: '',
          end_date: '',
          description: ''
        });

        this.errorMessage = '';

        return;
      } else {
        contractFields.forEach(f => {
          this.form.get(f)?.clearValidators();
          this.form.get(f)?.setValue('');
          this.form.get(f)?.updateValueAndValidity();
        });
      }

      this.isExistingPerson.set(false);

      this.form.patchValue({
        academic_staff_id: staff.id,
        names: staff.personal_information.names,
        fathers_surname: staff.personal_information.fathers_surname,
        mothers_surname: staff.personal_information.mothers_surname,
        dni: staff.personal_information.dni,
        email: staff.personal_information.email,
        phone_number: staff.personal_information.phone_number,
        address: staff.personal_information.address,
        district: staff.personal_information.district,
        province: staff.personal_information.province,
        department: staff.personal_information.department,
        gender: staff.personal_information.gender,
        role: staff.staff_type,
        position: '',
        start_date: '',
        end_date: '',
        description: staff.description ?? ''
      });

      this.errorMessage = '';

    });

  }

  get isEditMode(): boolean {
    return !!this.academicStaff();
  }

  private loadAcademicStaff(): void {
    this.academicStaffService
      .list()
      .subscribe({
        next: data =>
          this.academicStaffList.set(data)
      });

  }

  onAcademicStaffSelected(id: number): void {
    const staff = this.academicStaffList()
      .find(s => s.id === id);

    if (!staff) return;

    this.isExistingPerson.set(true);

    this.form.patchValue({

      academic_staff_id: staff.id,

      names: staff.personal_information.names,

      fathers_surname: staff.personal_information.fathers_surname,

      mothers_surname: staff.personal_information.mothers_surname,

      dni:
        staff.personal_information.dni,

      email:
        staff.personal_information.email,

      phone_number:
        staff.personal_information.phone_number,

      address:
        staff.personal_information.address,

      district:
        staff.personal_information.district,

      province:
        staff.personal_information.province,

      department:
        staff.personal_information.department,

      gender:
        staff.personal_information.gender,

      role:
        staff.staff_type

    });

  }

  onSubmit(): void {
    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.submitting = true;

    this.errorMessage = '';

    let request$: Observable<unknown>;

    if (this.isEditMode) {

      const payload: UpdateAcademicStaffPayload = {

        staff_type:
          this.form.value.role!,

        names:
          this.form.value.names!,

        fathers_surname:
          this.form.value.fathers_surname!,

        mothers_surname:
          this.form.value.mothers_surname!,

        dni:
          this.form.value.dni!,

        email:
          this.form.value.email!,

        phone_number:
          this.form.value.phone_number!,

        address:
          this.form.value.address!,

        district:
          this.form.value.district!,

        province:
          this.form.value.province!,

        department:
          this.form.value.department!,

        gender:
          this.form.value.gender!,

        description:
          this.form.value.description?.trim() || null

      };

      request$ =
        this.academicStaffService.update(
          this.academicStaff()!.id,
          payload
        );

    } else {

      const payload: SaveAcademicStaffPayload = {

        academic_staff_id:
          this.form.value.academic_staff_id || undefined,

        names:
          this.form.value.names!,

        fathers_surname:
          this.form.value.fathers_surname!,

        mothers_surname:
          this.form.value.mothers_surname!,

        dni:
          this.form.value.dni!,

        email:
          this.form.value.email!,

        phone_number:
          this.form.value.phone_number!,

        address:
          this.form.value.address!,

        district:
          this.form.value.district!,

        province:
          this.form.value.province!,

        department:
          this.form.value.department!,

        gender:
          this.form.value.gender!,

        role:
          this.form.value.role!,

        position:
          this.form.value.position!,

        start_date:
          this.form.value.start_date!,

        end_date:
          this.form.value.end_date!,

        description:
          this.form.value.description?.trim() || null

      };

      request$ =
        this.academicStaffService.create(payload);

    }

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

}