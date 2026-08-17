import { Component, input, output } from '@angular/core';
import { Grade } from '../grades.model';

@Component({
  selector: 'app-info-grade',
  standalone: true,
  imports: [],
  templateUrl: './info-grade.html',
  styleUrl: './info-grade.css',
})
export class InfoGrade {
  isOpen = input<boolean>(false);
  grade = input<Grade | null>(null);

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
