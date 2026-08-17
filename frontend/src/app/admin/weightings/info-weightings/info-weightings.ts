import { Component, input, output } from '@angular/core';
import { Weighting } from '../weightings.model';

@Component({
  selector: 'app-info-weightings',
  imports: [],
  templateUrl: './info-weightings.html',
  styleUrl: './info-weightings.css',
})
export class InfoWeightings {
  isOpen = input<boolean>(false);
  weighting = input<Weighting | null>(null);

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
