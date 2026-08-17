import { Component, input, output } from '@angular/core';
import { TeachingBlock } from '../teaching-blocks.model';

@Component({
  selector: 'app-info-teaching-blocks',
  imports: [],
  standalone: true,
  templateUrl: './info-teaching-blocks.html',
  styleUrl: './info-teaching-blocks.css',
})
export class InfoTeachingBlocks {
  isOpen = input<boolean>(false);
  teachingBlock = input<TeachingBlock | null>(null);

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
