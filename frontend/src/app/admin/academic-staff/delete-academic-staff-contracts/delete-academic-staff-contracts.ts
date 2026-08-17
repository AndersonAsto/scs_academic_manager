import {
  Component,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import { AcademicStaffContractsService } from '../academic-staff-contracts/academic-staff-contracts.service';
import { AcademicStaffContract } from '../academic-staff-contracts/academic-staff-contracts.model';

@Component({
  selector: 'app-delete-academic-staff-contracts',
  standalone: true,
  imports: [],
  templateUrl: './delete-academic-staff-contracts.html',
  styleUrl: './delete-academic-staff-contracts.css',
})
export class DeleteAcademicStaffContracts {

  private contractsService = inject(AcademicStaffContractsService);

  contract = input<AcademicStaffContract | null>(null);
  isOpen = input<boolean>(false);

  closeModal = output<void>();
  deleted = output<void>();

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  onBackdropClick(): void {
    if (!this.submitting()) {
      this.onClose();
    }
  }

  onClose(): void {
    if (this.submitting()) {
      return;
    }

    this.errorMessage.set(null);
    this.closeModal.emit();
  }

  onDelete(del: 0 | 1): void {

    const contract = this.contract();

    if (!contract) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.contractsService.delete(contract.id, del).subscribe({

      next: () => {

        this.submitting.set(false);

        this.deleted.emit();
        this.closeModal.emit();

      },

      error: (error) => {

        this.submitting.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No se pudo procesar la eliminación del contrato.'
        );

      }

    });
  }
}