import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { Year } from '../years.model';
import { YearService } from '../years.service';

@Component({
  selector: 'app-delete-year',
  standalone: true,
  imports: [],
  templateUrl: './delete-year.html',
  styleUrl: './delete-year.css',
})
export class DeleteYear {
  private yearService = inject(YearService);

  @Input() isOpen = false;
  @Input() year: Year | null = null;

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
    if (!this.year || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.yearService.delete(this.year.id, del).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },
      error: (error) => {
        this.submitting.set(false);

        this.errorMessage.set(
          error?.error?.message ||
          'No se pudo procesar la eliminación del año lectivo.'
        );
      }
    });
  }
}