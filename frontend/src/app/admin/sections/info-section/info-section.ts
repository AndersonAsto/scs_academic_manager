import { Component, input, output } from '@angular/core';
import { Section } from '../sections.model';

@Component({
  selector: 'app-info-section',
  imports: [],
  standalone: true,
  templateUrl: './info-section.html',
  styleUrl: './info-section.css',
})
export class InfoSection {
  isOpen = input<boolean>(false);
  section = input<Section | null>(null);

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
