import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SchoolDay } from '../school-days.model';
import { SchoolDaysService } from '../school-days.service';

@Component({
  selector: 'app-update-school-days',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './update-school-days.html',
  styleUrl: './update-school-days.css',
})
export class UpdateSchoolDays {

  private fb = inject(FormBuilder);
  private schoolDayService = inject(SchoolDaysService);

  isOpen = input(false);
  schoolDay = input<SchoolDay | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  readonly typeOptions = [
    'Día Lectivo',
    'Día Feriado'
  ];

  form = this.fb.group({

    year: this.fb.control<number | null>(
      { value: null, disabled: true },
      Validators.required
    ),

    teaching_block: this.fb.control(
      { value: '', disabled: true },
      Validators.required
    ),

    school_day: this.fb.control(
      { value: '', disabled: true },
      Validators.required
    ),

    day: this.fb.control(
      { value: '', disabled: true },
      Validators.required
    ),

    week_number: this.fb.control(
      { value: 0, disabled: true },
      Validators.required
    ),

    type: this.fb.nonNullable.control(
      'Calificación Diaria',
      Validators.required
    ),

    description: this.fb.control('')
  });

  constructor() {

    effect(() => {

      if (!this.isOpen()) return;

      const schoolDay = this.schoolDay();

      if (!schoolDay) return;

      this.form.patchValue({

        year: schoolDay.teaching_block.year.year,

        teaching_block: schoolDay.teaching_block.teaching_block,

        school_day: schoolDay.school_day,

        day: schoolDay.day,

        week_number: schoolDay.week_number,

        type: schoolDay.type,

        description: schoolDay.description ?? ''

      });

      this.errorMessage = '';

    });

  }

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {

    if (this.form.invalid || !this.schoolDay()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const value = this.form.getRawValue();

    const payload = {
      type: value.type,
      description: value.description || null
    };

    this.schoolDayService
      .update(this.schoolDay()!.id, payload)
      .subscribe({

        next: () => {

          this.submitting = false;
          this.saved.emit();

        },

        error: err => {

          this.submitting = false;

          this.errorMessage =
            err?.error?.message ??
            'Ocurrió un error. Inténtelo nuevamente.';

        }

      });

  }

}