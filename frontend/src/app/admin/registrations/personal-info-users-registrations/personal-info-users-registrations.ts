import { Component as NgComponent, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { StudentsService, UpdateStudentPayload } from '../students/students.service';
import { ParentsService, UpdateParentPayload } from '../parents/parents.service';
import { UserService, UpdateUserPayload } from '../../personal-information/users.service';
import { PersonalInformation } from '../../personal-information/personal-information.model';

export type EntityType = 'student' | 'parent';

export interface PersonalInfoModalData {
  type: EntityType;
  entityId: number;
  personalInfo: PersonalInformation;
}

@NgComponent({
  selector: 'app-personal-info-users-registrations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info-users-registrations.html',
  styleUrl: './personal-info-users-registrations.css',
})
export class PersonalInfoUsersRegistrations implements OnChanges {
  @Input() isOpen = false;
  @Input() data: PersonalInfoModalData | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private studentsService = inject(StudentsService);
  private parentsService = inject(ParentsService);
  private userService = inject(UserService);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  roles: string[] = ['Administrador', 'Docente', 'Estudiante', 'Apoderado'];

  form: FormGroup = this.fb.group({
    names: ['', [Validators.required]],
    fathers_surname: ['', [Validators.required]],
    mothers_surname: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required]],
    address: ['', [Validators.required]],
    district: ['', [Validators.required]],
    province: ['', [Validators.required]],
    department: ['', [Validators.required]],
    gender: ['M', [Validators.required]],
    description: [''],
    // Campos del usuario (exclusivos para Apoderado)
    username: [''],
    password: [''],
    role: ['Apoderado']
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data'] || changes['isOpen']) && this.isOpen && this.data) {
      this.populateForm();
    }
  }

  get isParent(): boolean {
    return this.data?.type === 'parent';
  }

  private populateForm(): void {
    if (!this.data) return;

    const info = this.data.personalInfo;

    this.isActive.set(info.status);

    this.form.patchValue({
      names: info.names || '',
      fathers_surname: info.fathers_surname || '',
      mothers_surname: info.mothers_surname || '',
      dni: info.dni || '',
      email: info.email || '',
      phone_number: info.phone_number || '',
      address: info.address || '',
      district: info.district || '',
      province: info.province || '',
      department: info.department || '',
      gender: info.gender || 'M',
      description: info.description || '',
      username: '',
      password: '',
      role: 'Apoderado'
    });

    if (this.isParent) {
      this.form.get('username')?.setValidators([Validators.required]);
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('role')?.setValidators([Validators.required]);

      // Consultar datos actuales del usuario vinculado
      this.loading.set(true);
      this.userService.list(info.id).subscribe({
        next: (users) => {
          if (users.length > 0) {
            const user = users[0];
            this.form.patchValue({
              username: user.username || '',
              role: user.role || 'Apoderado'
            });
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.form.get('username')?.clearValidators();
      this.form.get('password')?.clearValidators();
      this.form.get('role')?.clearValidators();
    }

    this.form.get('username')?.updateValueAndValidity();
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('role')?.updateValueAndValidity();
  }

  onSave(): void {
    if (this.form.invalid || !this.data) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const formValues = this.form.value;

    if (this.data.type === 'student') {
      const payload: UpdateStudentPayload = {
        names: formValues.names,
        fathers_surname: formValues.fathers_surname,
        mothers_surname: formValues.mothers_surname,
        dni: formValues.dni,
        email: formValues.email,
        phone_number: formValues.phone_number,
        address: formValues.address,
        district: formValues.district,
        province: formValues.province,
        department: formValues.department,
        gender: formValues.gender,
        description: formValues.description || null
      };

      this.studentsService.update(this.data.entityId, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Error al actualizar el estudiante.');
        }
      });
    } else {
      const parentPayload: UpdateParentPayload = {
        names: formValues.names,
        fathers_surname: formValues.fathers_surname,
        mothers_surname: formValues.mothers_surname,
        dni: formValues.dni,
        email: formValues.email,
        phone_number: formValues.phone_number,
        address: formValues.address,
        district: formValues.district,
        province: formValues.province,
        department: formValues.department,
        gender: formValues.gender,
        description: formValues.description || null
      };

      const userPayload: UpdateUserPayload = {
        username: formValues.username,
        hashed_password: formValues.password,
        role: formValues.role,
        description: formValues.description || null
      };

      const personalInfoId = this.data.personalInfo.id;

      // Actualizar datos del apoderado y del usuario en paralelo
      forkJoin({
        parent: this.parentsService.update(this.data.entityId, parentPayload),
        user: this.userService.update(personalInfoId, userPayload)
      }).subscribe({
        next: () => {
          this.loading.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Error al actualizar el apoderado o su usuario.');
        }
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  onClose(): void {
    this.errorMessage.set(null);
    this.closeModal.emit();
  }

  submittingStatus = signal(false);
  statusMessage = signal<string | null>(null);
  statusError = signal<string | null>(null);

  onDeactivate(): void {
    if (!this.data) {
      return;
    }

    this.submittingStatus.set(true);

    const request =
      this.data.type === 'student'
        ? this.studentsService.delete(this.data.entityId, 0)
        : this.parentsService.delete(this.data.entityId, 0);

    request.subscribe({
      next: () => {
        this.isActive.set(false);
        this.submittingStatus.set(false);
        this.saved.emit();
      },

      error: (err) => {
        this.submittingStatus.set(false);

        this.errorMessage.set(
          err.error?.message ??
          'No se pudo desactivar el registro.'
        );
      }
    });
  }

  onRestore(): void {
    if (!this.data) {
      return;
    }

    this.submittingStatus.set(true);

    const request =
      this.data.type === 'student'
        ? this.studentsService.restore(this.data.entityId)
        : this.parentsService.restore(this.data.entityId);

    request.subscribe({
      next: () => {
        this.isActive.set(true);
        this.submittingStatus.set(false);
        this.saved.emit();
      },

      error: (err) => {
        this.submittingStatus.set(false);

        this.errorMessage.set(
          err.error?.message ??
          'No se pudo restaurar el registro.'
        );
      }
    });
  }

  isActive = signal(false);
}