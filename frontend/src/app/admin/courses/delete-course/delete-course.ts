import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { Course } from '../courses.model';
import { CourseService } from '../courses.service';

@Component({
  selector: 'app-delete-course',
  standalone: true,
  imports: [],
  templateUrl: './delete-course.html',
  styleUrl: './delete-course.css',
})
export class DeleteCourse {
  private courseService = inject(CourseService);

  @Input() isOpen = false;
  @Input() course: Course | null = null;

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
    if (!this.course || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.courseService.delete(this.course.id, del).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },
      error: (error) => {
        this.submitting.set(false);

        this.errorMessage.set(
          error?.error?.message ||
          'No se pudo procesar la eliminación del curso.'
        );
      }
    });
  }
}