import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { TimeSlot } from '../time-slots.model';
import { TimeSlotService } from '../time-slots.service';

@Component({
  selector: 'app-delete-time-slots',
  standalone: true,
  imports: [],
  templateUrl: './delete-time-slots.html',
  styleUrl: './delete-time-slots.css',
})
export class DeleteTimeSlots {
  private timeSlotService = inject(TimeSlotService);

  @Input() isOpen = false;
  @Input() timeSlot: TimeSlot | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  onClose(): void {
    if (this.submitting()) return;

    this.errorMessage.set(null);
    this.closeModal.emit();
  }

  onDelete(del: 0 | 1): void {
    if (!this.timeSlot || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.timeSlotService.delete(this.timeSlot.id, del).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },
      error: (error) => {
        this.submitting.set(false);

        this.errorMessage.set(
          error?.error?.message ||
          'No se pudo procesar la eliminación de la franja horaria.'
        );
      }
    });
  }
}