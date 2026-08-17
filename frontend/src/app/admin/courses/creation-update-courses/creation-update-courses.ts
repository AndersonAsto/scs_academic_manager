import { Component, inject, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CourseService } from '../courses.service';
import { Course } from '../courses.model';

@Component({
  selector: 'app-creation-update-courses',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './creation-update-courses.html',
  styleUrl: './creation-update-courses.css',
})
export class CreationUpdateCourses {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);

  isOpen = input<boolean>(false);
  courseToEdit = input<Course | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  form = this.fb.group({
    course: ['', [Validators.required, Validators.maxLength(100)]],
    recurrence: [1, [Validators.required, Validators.min(1), Validators.max(7)]],
    description: ['']
  });

  constructor() {
    effect(() => {
      const course = this.courseToEdit();
      if (this.isOpen()) {
        if (course) {
          this.form.patchValue({
            course: course.course,
            recurrence: course.recurrence,
            description: course.description ?? ''
          });
        } else {
          this.form.reset({ course: '', recurrence: 1, description: '' });
        }
        this.errorMessage = '';
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.courseToEdit();
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
      course: this.form.value.course!.trim(),
      recurrence: Number(this.form.value.recurrence),
      description: this.form.value.description?.trim() || null
    };

    const editing = this.courseToEdit();

    const request$: Observable<unknown> = editing
      ? this.courseService.update(editing.id, payload)
      : this.courseService.create(payload);

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