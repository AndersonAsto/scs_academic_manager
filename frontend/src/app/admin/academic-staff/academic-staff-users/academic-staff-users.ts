import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UpdateUserPayload } from '../../personal-information/users.service';
import { User } from '../../personal-information/users.model';
import { AcademicStaffModel } from '../academic-staff.model';

@Component({
  selector: 'app-academic-staff-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './academic-staff-users.html',
  styleUrl: './academic-staff-users.css',
})
export class AcademicStaffUsers {
  private userService = inject(UserService);

  academicStaff = input<AcademicStaffModel | null>(null);
  isOpen = input<boolean>(false);
  closeModal = output<void>();

  user = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  isEditing = signal(false);
  saving = signal(false);

  roles = signal<string[]>(['Administrador', 'Docente', 'Estudiante', 'Apoderado']);

  editForm = signal<UpdateUserPayload>({
    username: '',
    hashed_password: '',
    role: '',
    description: ''
  });

  constructor() {
    effect(() => {
      const staff = this.academicStaff();
      if (this.isOpen() && staff?.personal_information_id) {
        this.loadUser(staff.personal_information_id);
      }
    });
  }

  loadUser(personalInformationId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.isEditing.set(false);

    this.userService.list(personalInformationId).subscribe({
      next: (users) => {
        const foundUser = users[0] || null;
        this.user.set(foundUser);
        if (foundUser) {
          this.initForm(foundUser);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al obtener la información del usuario.');
        this.loading.set(false);
      }
    });
  }

  initForm(userData: User): void {
    this.editForm.set({
      username: userData.username || '',
      hashed_password: '',
      role: userData.role || this.academicStaff()?.staff_type || '',
      description: userData.description || ''
    });
  }

  startEdit(): void {
    if (this.user()) {
      this.initForm(this.user()!);
    }
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  saveUser(): void {
    const staff = this.academicStaff();
    if (!staff?.personal_information_id) return;

    this.saving.set(true);
    this.userService.update(staff.personal_information_id, this.editForm()).subscribe({
      next: () => {
        this.saving.set(false);
        this.loadUser(staff.personal_information_id);
      },
      error: (err) => {
        this.saving.set(false);
        alert(err.error?.message || 'Error al actualizar las credenciales de usuario.');
      }
    });
  }

  onClose(): void {
    this.isEditing.set(false);
    this.closeModal.emit();
  }
}