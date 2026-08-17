import { Component, inject, input, output, signal } from '@angular/core';
import { SchedulesService } from '../schedules.service';
import { Schedule } from '../schedules.model';

@Component({
  selector: 'app-delete-schedules',
  imports: [],
  templateUrl: './delete-schedules.html',
  styleUrl: './delete-schedules.css',
})
export class DeleteSchedules {
  private schedulesService = inject(SchedulesService);

  isOpen = input(false);
  schedule = input<Schedule | null>(null);

  closeModal = output<void>();
  deleted = output<void>();

  loading = signal(false);
  error = signal<string | null>(null);

  onClose(): void {
    if (this.loading()) return;

    this.error.set(null);
    this.closeModal.emit();
  }

  onDelete(del: 0 | 1): void {
    const schedule = this.schedule();

    if (!schedule || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.schedulesService.delete(schedule.id, del).subscribe({
      next: () => {
        this.loading.set(false);
        this.deleted.emit();
      },
      error: (error) => {
        this.loading.set(false);

        this.error.set(
          error?.error?.message ??
          'No se pudo procesar la eliminación del horario.'
        );
      }
    });
  }
}