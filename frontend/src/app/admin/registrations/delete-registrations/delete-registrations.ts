import {
  Component,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import { Registration } from '../registration.model';
import { RegistrationsService } from '../registrations.service';

@Component({
  selector: 'app-delete-registrations',
  standalone: true,
  imports: [],
  templateUrl: './delete-registrations.html',
  styleUrl: './delete-registrations.css',
})
export class DeleteRegistrations {

  private registrationsService = inject(RegistrationsService);

  isOpen = input<boolean>(false);
  registration = input<Registration | null>(null);

  closeModal = output<void>();
  deleted = output<void>();

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  onClose(): void {

    if (this.submitting()) {
      return;
    }

    this.errorMessage.set(null);
    this.closeModal.emit();
  }

  onBackdropClick(): void {

    if (this.submitting()) {
      return;
    }

    this.onClose();
  }

  onDelete(del: 0 | 1): void {

    const registration = this.registration();

    if (!registration) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.registrationsService
      .delete(registration.id, del)
      .subscribe({

        next: () => {

          this.submitting.set(false);

          this.deleted.emit();
        },

        error: (error) => {

          this.submitting.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No se pudo procesar la matrícula.'
          );
        }

      });
  }

  onRestore(): void {

    const registration = this.registration();

    if (!registration) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.registrationsService
      .restore(registration.id)
      .subscribe({

        next: () => {

          this.submitting.set(false);

          this.deleted.emit();
        },

        error: (error) => {

          this.submitting.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'No se pudo restaurar la matrícula.'
          );
        }

      });
  }
}