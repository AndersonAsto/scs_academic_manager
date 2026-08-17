import { Component, inject, input, output, signal } from '@angular/core';
import { TeachingBlockService } from '../teaching-blocks.service';

@Component({
  selector: 'app-delete-teaching-blocks',
  standalone: true,
  imports: [],
  templateUrl: './delete-teaching-blocks.html',
  styleUrl: './delete-teaching-blocks.css'
})
export class DeleteTeachingBlocks {

  private teachingBlockService = inject(TeachingBlockService);

  isOpen = input(false);
  yearId = input<number | null>(null);
  year = input<{ id: number; year: number } | null>(null);

  closeModal = output<void>();
  deleted = output<void>();

  submitting = signal(false);
  errorMessage = signal('');

  onClose(): void {
    if (this.submitting()) {
      return;
    }

    this.closeModal.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  onDelete(del: 0 | 1): void {

    const yearId = this.yearId();

    if (!yearId) {
      this.errorMessage.set('No se ha seleccionado un año lectivo.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.teachingBlockService.deleteByYear(yearId, del).subscribe({

      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },

      error: err => {
        this.submitting.set(false);

        this.errorMessage.set(
          err?.error?.message ??
          'No se pudieron procesar los bloques lectivos.'
        );
      }

    });
  }
}