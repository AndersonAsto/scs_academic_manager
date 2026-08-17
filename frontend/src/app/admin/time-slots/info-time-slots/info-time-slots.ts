import { Component, output, input } from '@angular/core';
import { TimeSlot } from '../time-slots.model';

@Component({
  selector: 'app-info-time-slots',
  imports: [],
  templateUrl: './info-time-slots.html',
  styleUrl: './info-time-slots.css',
})
export class InfoTimeSlots {
  isOpen = input<boolean>(false);
    timeSlot = input<TimeSlot | null>(null);
  
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
