import {
  Component,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { AcademicStaffModel } from '../academic-staff.model';
import { AcademicStaffService } from '../academic-staff.service';

@Component({
  selector: 'app-delete-academic-staff',
  standalone: true,
  imports: [],
  templateUrl: './delete-academic-staff.html',
  styleUrl: './delete-academic-staff.css'
})
export class DeleteAcademicStaff {

  private academicStaffService = inject(AcademicStaffService);

  isOpen = input(false);
  academicStaff = input<AcademicStaffModel | null>(null);

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

    const staff = this.academicStaff();

    if (!staff) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.academicStaffService.delete(staff.id, del).subscribe({

      next: () => {

        this.submitting.set(false);

        this.deleted.emit();
        this.closeModal.emit();

      },

      error: (error) => {

        this.submitting.set(false);

        this.errorMessage.set(
          error.error?.message ||
          'No se pudo realizar la operación.'
        );

      }

    });
  }
}