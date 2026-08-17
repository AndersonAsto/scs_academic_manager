import { Component, inject, input, output } from '@angular/core';
import { Registration } from '../registration.model';
import { RegistrationPdfService } from './registration-pdf.service';

@Component({
  selector: 'app-info-registration',
  imports: [],
  standalone: true,
  templateUrl: './info-registration.html',
  styleUrl: './info-registration.css',
})
export class InfoRegistration {
  private registrationPdfService = inject(RegistrationPdfService);
  isOpen = input<boolean>(false);
  registration = input<Registration | null>(null);

  closeModal = output<void>();

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    const date = new Date(value.replace(' ', 'T'));
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadPdf(): void {
    const registration = this.registration();
    if (!registration) {
      return;
    }
    this.registrationPdfService.generate(registration);
  }
}
