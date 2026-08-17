import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicStaffModel } from './academic-staff.model';
import { AcademicStaffService } from './academic-staff.service';
import { InfoAcademicStaff } from './info-academic-staff/info-academic-staff';
import { CreateUpdateAcademicStaff } from './create-update-academic-staff/create-update-academic-staff';
import { AcademicStaffContracts } from './academic-staff-contracts/academic-staff-contracts';
import { AcademicStaffUsers } from './academic-staff-users/academic-staff-users';
import { DeleteAcademicStaff } from './delete-academic-staff/delete-academic-staff';

@Component({
  selector: 'app-academic-staff',
  standalone: true,
  imports: [FormsModule, InfoAcademicStaff, CreateUpdateAcademicStaff, AcademicStaffContracts, AcademicStaffUsers, DeleteAcademicStaff],
  templateUrl: './academic-staff.html',
  styleUrl: './academic-staff.css',
})
export class AcademicStaff {
  private academicStaffService = inject(AcademicStaffService);

  academicStaff = signal<AcademicStaffModel[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  isFormModalOpen = signal(false);
  academicStaffToEdit = signal<AcademicStaffModel | null>(null);

  isInfoModalOpen = signal(false);
  academicStaffToView = signal<AcademicStaffModel | null>(null);

  constructor() {
    this.fetchAcademicStaff();
  }

  filteredAcademicStaff = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.academicStaff().filter(as => {
      const person = as.personal_information;

      const searchable = [
        person.names,
        person.fathers_surname,
        person.mothers_surname,
        `${person.names} ${person.fathers_surname} ${person.mothers_surname}`,
        person.dni,
        person.email,
        person.phone_number,
      ].join(' ').toLowerCase();

      const matchesSearch =
        !term ||
        searchable.includes(term);

      const matchesStaff =
        this.selectedStaffType() === null ||
        as.staff_type === this.selectedStaffType();

      return (matchesSearch && matchesStaff);
    });
  });

  fetchAcademicStaff(): void {
    this.loading.set(true);
    this.error.set(null);

    this.academicStaffService.list().subscribe({
      next: (data) => {
        this.academicStaff.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se ha podido cargar el personal académico.');
        this.loading.set(false);
      }
    });
  }

  onAdd(): void {
    this.academicStaffToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  onEdit(academicStaff: AcademicStaffModel): void {
    this.academicStaffToEdit.set(academicStaff);
    this.isFormModalOpen.set(true);
  }

  onCloseFormModal(): void {
    this.academicStaffToEdit.set(null);
    this.isFormModalOpen.set(false);
  }

  onSaved(): void {
    this.isFormModalOpen.set(false);
    this.academicStaffToEdit.set(null);
    this.fetchAcademicStaff();
  }

  onInfo(academicStaff: AcademicStaffModel): void {
    this.academicStaffToView.set(academicStaff);
    this.isInfoModalOpen.set(true);
  }

  onCloseInfoModal(): void {
    this.isInfoModalOpen.set(false);
    this.academicStaffToView.set(null);
  }

  selectedStaffType = signal<string | null>(null);

  staffTypes = computed(() => {
    return [...new Set(
      this.academicStaff().map(
        as => as.staff_type
      )
    )];
  });

  clearFilters(): void {
    this.searchTerm.set('');

    this.selectedStaffType.set(null);
  }

  isContractsModalOpen = signal(false);
  academicStaffContractsToView = signal<AcademicStaffModel | null>(null);

  onContracts(staff: AcademicStaffModel): void {
    this.academicStaffContractsToView.set(staff);
    this.isContractsModalOpen.set(true);
  }

  onCloseContractsModal(): void {
    this.isContractsModalOpen.set(false);
    this.academicStaffContractsToView.set(null);
  }

  // Señales para el modal de usuarios
  isUsersModalOpen = signal(false);
  academicStaffUserToView = signal<AcademicStaffModel | null>(null);

  // Abrir modal de usuario
  onUsers(staff: AcademicStaffModel): void {
    this.academicStaffUserToView.set(staff);
    this.isUsersModalOpen.set(true);
  }

  // Cerrar modal de usuario
  onCloseUsersModal(): void {
    this.isUsersModalOpen.set(false);
    this.academicStaffUserToView.set(null);
  }

  isDeleteModalOpen = signal(false);
  academicStaffToDelete = signal<AcademicStaffModel | null>(null);

  onDelete(academicStaff: AcademicStaffModel): void {
    this.academicStaffToDelete.set(academicStaff);
    this.isDeleteModalOpen.set(true);
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.academicStaffToDelete.set(null);
  }

  onDeleted(): void {
    this.isDeleteModalOpen.set(false);
    this.academicStaffToDelete.set(null);
    this.fetchAcademicStaff();
  }

  onRestore(academicStaff: AcademicStaffModel): void {

    this.academicStaffService.restore(academicStaff.id).subscribe({

      next: () => {
        this.fetchAcademicStaff();
      },

      error: (error) => {
        this.error.set(
          error.error?.message ||
          'No se pudo reactivar el personal académico.'
        );
      }

    });
  }
}
