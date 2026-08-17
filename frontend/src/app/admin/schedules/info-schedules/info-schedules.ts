import { Component, input, output } from '@angular/core';
import { Schedule } from '../schedules.model';

@Component({
  selector: 'app-info-schedules',
  imports: [],
  templateUrl: './info-schedules.html',
  styleUrl: './info-schedules.css',
})
export class InfoSchedules {
  isOpen = input<boolean>(false);
  schedule = input<Schedule | null>(null);

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
