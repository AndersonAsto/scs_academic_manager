import {
  Component,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { SchoolDaysByScheduleService } from '../school-days-by-schedules/school-days-by-schedules.service';

@Component({
  selector: 'app-delete-school-days-by-schedule',
  imports: [],
  templateUrl: './delete-school-days-by-schedule.html',
  styleUrl: './delete-school-days-by-schedule.css',
})
export class DeleteSchoolDaysBySchedule {

  private service = inject(SchoolDaysByScheduleService);

  isOpen = input(false);

  year = input<{ id: number; year: number } | null>(null);

  closeModal = output<void>();
  deleted = output<void>();

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  onClose(): void {
    if (this.submitting()) return;

    this.errorMessage.set(null);
    this.closeModal.emit();
  }

  onBackdropClick(): void {
    if (this.submitting()) return;

    this.onClose();
  }

  onDelete(del: 0 | 1): void {

    const selectedYear = this.year();

    if (!selectedYear) {
      this.errorMessage.set(
        'No se ha seleccionado un año académico.'
      );
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.service.deleteByYear(
      selectedYear.id,
      del
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },

      error: (error) => {
        this.submitting.set(false);

        this.errorMessage.set(
          error?.error?.message ??
          'No se pudieron procesar las sesiones lectivas.'
        );
      }
    });
  }
}