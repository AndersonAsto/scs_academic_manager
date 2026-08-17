import { Component, input, output } from '@angular/core';
import { Year } from '../years.model';

@Component({
  selector: 'app-info-year',
  imports: [],
  standalone: true,
  templateUrl: './info-year.html',
  styleUrl: './info-year.css',
})
export class InfoYear {
  isOpen = input<boolean>(false);
  year = input<Year | null>(null);

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
}
