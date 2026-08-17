import { Component, input, output } from '@angular/core';
import { SchoolDay } from '../school-days.model';

@Component({
  selector: 'app-info-school-days',
  imports: [],
  standalone: true,
  templateUrl: './info-school-days.html',
  styleUrl: './info-school-days.css',
})
export class InfoSchoolDays {
  isOpen = input<boolean>(false);
    schoolDay = input<SchoolDay | null>(null);
  
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
