import { Component, inject, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Grade } from '../grades.model';
import { GradeService } from '../grades.service';

@Component({
  selector: 'app-create-update-grades',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-update-grades.html',
  styleUrl: './create-update-grades.css',
})
export class CreateUpdateGrades {
  private fb = inject(FormBuilder);
  private gradeService = inject(GradeService);

  isOpen = input<boolean>(false);
  gradeToEdit = input<Grade | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  form = this.fb.group({
    grade: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['']
  });

  constructor() {
    // Sincroniza el formulario cada vez que cambia el curso a editar o se abre el modal
    effect(() => {
      const grade = this.gradeToEdit();
      if (this.isOpen()) {
        if (grade) {
          this.form.patchValue({
            grade: grade.grade,
            description: grade.description ?? ''
          });
        } else {
          this.form.reset({ grade: '', description: '' });
        }
        this.errorMessage = '';
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.gradeToEdit();
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {
      grade: this.form.value.grade!.trim(),
      description: this.form.value.description?.trim() || null
    };

    const editing = this.gradeToEdit();

    const request$: Observable<unknown> = editing
      ? this.gradeService.update(editing.id, payload)
      : this.gradeService.create(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.saved.emit();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Ocurrió un error. Inténtalo de nuevo.';
      }
    });
  }
}
