import { Component, inject, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Year } from '../years.model';
import { YearService } from '../years.service';

@Component({
  selector: 'app-create-update-years',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-update-years.html',
  styleUrl: './create-update-years.css',
})
export class CreateUpdateYears {
  private fb = inject(FormBuilder);
  private yearService = inject(YearService);

  private currentYear = new Date().getFullYear();

  isOpen = input<boolean>(false);
  yearToEdit = input<Year | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  form = this.fb.group({
    year: [this.currentYear, [Validators.required, Validators.min(1950), Validators.max(2100)]],
    description: ['']
  });

  constructor() {
    effect(() => {
      const year = this.yearToEdit();
      if (this.isOpen()) {
        if (year) {
          this.form.patchValue({
            year: year.year,
            description: year.description ?? ''
          });
        } else {
          this.form.reset({ year: this.currentYear, description: '' });
        }
        this.errorMessage = '';
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.yearToEdit();
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
      year: Number(this.form.value.year),
      description: this.form.value.description?.trim() || null
    };

    const editing = this.yearToEdit();

    const request$: Observable<unknown> = editing
      ? this.yearService.update(editing.id, payload)
      : this.yearService.create(payload);

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
