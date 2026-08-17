import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicStaffContractsService, UpdateAcademicContractPayload } from './academic-staff-contracts.service';
import { AcademicStaffContract } from './academic-staff-contracts.model';
import { AcademicStaffModel } from '../academic-staff.model';
import { DeleteAcademicStaffContracts } from '../delete-academic-staff-contracts/delete-academic-staff-contracts';

@Component({
  selector: 'app-academic-staff-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteAcademicStaffContracts],
  templateUrl: './academic-staff-contracts.html',
  styleUrl: './academic-staff-contracts.css',
})
export class AcademicStaffContracts {
  private contractsService = inject(AcademicStaffContractsService);

  academicStaff = input<AcademicStaffModel | null>(null);
  isOpen = input<boolean>(false);
  closeModal = output<void>();

  contracts = signal<AcademicStaffContract[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  editingContractId = signal<number | null>(null);
  editForm = signal<UpdateAcademicContractPayload>({
    start_date: '',
    end_date: '',
    position: '',
    description: ''
  });

  constructor() {
    effect(() => {
      const staff = this.academicStaff();
      if (this.isOpen() && staff) {
        this.loadContracts(staff.id);
      }
    });
  }

  loadContracts(staffId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.contractsService.list(staffId).subscribe({
      next: (data) => {
        this.contracts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los contratos del personal.');
        this.loading.set(false);
      }
    });
  }

  startEdit(contract: AcademicStaffContract): void {
    this.editingContractId.set(contract.id);
    this.editForm.set({
      start_date: contract.start_date,
      end_date: contract.end_date,
      position: contract.position,
      description: contract.description
    });
  }

  cancelEdit(): void {
    this.editingContractId.set(null);
  }

  saveEdit(contractId: number): void {
    this.contractsService.update(contractId, this.editForm()).subscribe({
      next: () => {
        this.editingContractId.set(null);
        if (this.academicStaff()) {
          this.loadContracts(this.academicStaff()!.id);
        }
      },
      error: () => {
        alert('Error al actualizar el contrato.');
      }
    });
  }

  onClose(): void {
    this.editingContractId.set(null);
    this.closeModal.emit();
  }

  isDeleteModalOpen = signal(false);
  contractToDelete = signal<AcademicStaffContract | null>(null);

  onDelete(contract: AcademicStaffContract): void {
    this.contractToDelete.set(contract);
    this.isDeleteModalOpen.set(true);
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.contractToDelete.set(null);
  }

  onContractDeleted(): void {

    this.isDeleteModalOpen.set(false);
    this.contractToDelete.set(null);

    const staff = this.academicStaff();

    if (staff) {
      this.loadContracts(staff.id);
    }
  }
}