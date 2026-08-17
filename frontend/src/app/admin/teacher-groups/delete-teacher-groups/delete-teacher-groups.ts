import { Component, inject, input, output, signal } from '@angular/core';
import { TeacherGroup } from '../teacher-groups.model';
import { TeacherGroupsService } from '../teacher-groups.service';

@Component({
  selector: 'app-delete-teacher-groups',
  standalone: true,
  imports: [],
  templateUrl: './delete-teacher-groups.html',
  styleUrl: './delete-teacher-groups.css',
})
export class DeleteTeacherGroups {

  private teacherGroupsService = inject(TeacherGroupsService);

  isOpen = input(false);
  teacherGroup = input<TeacherGroup | null>(null);

  closeModal = output<void>();
  deleted = output<void>();

  submitting = signal(false);
  errorMessage = signal('');

  onClose(): void {
    if (this.submitting()) return;

    this.closeModal.emit();
  }

  onDelete(del: 0 | 1): void {

    const teacherGroup = this.teacherGroup();

    if (!teacherGroup) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    this.teacherGroupsService.delete(teacherGroup.id, del).subscribe({

      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },

      error: err => {
        this.submitting.set(false);

        this.errorMessage.set(
          err?.error?.message ??
          'Ocurrió un error al procesar la solicitud.'
        );
      }

    });
  }
}