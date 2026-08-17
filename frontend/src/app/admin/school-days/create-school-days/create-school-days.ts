import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';

import { Year } from '../../years/years.model';
import { YearService } from '../../years/years.service';
import { SchoolDaysService } from '../school-days.service';

@Component({
  selector: 'app-create-school-days',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-school-days.html',
  styleUrl: './create-school-days.css',
})
export class CreateSchoolDays {

  private fb = inject(FormBuilder);
  private yearService = inject(YearService);
  private schoolDayService = inject(SchoolDaysService);

  years = signal<Year[]>([]);

  isOpen = input(false);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  form = this.fb.group({
    year_id: this.fb.control<number | null>(
      null,
      Validators.required
    )
  });

  constructor() {
    this.loadYears();
  }

  private loadYears(): void {

    this.yearService.list().subscribe({

      next: years => this.years.set(years),

      error: () => {
        this.errorMessage = 'No se pudieron cargar los años.';
      }

    });

  }

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  onCancel(): void {
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
      year_id: this.form.getRawValue().year_id!
    };

    this.schoolDayService.create(payload).subscribe({

      next: () => {

        this.submitting = false;

        this.saved.emit();

        this.form.reset({
          year_id: null
        });

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