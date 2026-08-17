import { Component, input, output } from '@angular/core';
import { Course } from '../courses.model';

@Component({
  selector: 'app-course-info',
  standalone: true,
  imports: [],
  templateUrl: './course-info.html',
  styleUrl: './course-info.css',
})
export class CourseInfo {
  isOpen = input<boolean>(false);
  course = input<Course | null>(null);

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