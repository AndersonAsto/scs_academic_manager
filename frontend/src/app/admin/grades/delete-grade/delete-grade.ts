import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { Grade } from '../grades.model';
import { GradeService } from '../grades.service';

@Component({
  selector: 'app-delete-grade',
  standalone: true,
  imports: [],
  templateUrl: './delete-grade.html',
  styleUrl: './delete-grade.css',
})
export class DeleteGrade {
  private gradeService = inject(GradeService);

  @Input() isOpen = false;
  @Input() grade: Grade | null = null;

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
    if (!this.grade || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.gradeService.delete(this.grade.id, del).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },
      error: (error) => {
        this.submitting.set(false);

        this.errorMessage.set(
          error?.error?.message ||
          'No se pudo procesar la eliminación del grado.'
        );
      }
    });
  }
}