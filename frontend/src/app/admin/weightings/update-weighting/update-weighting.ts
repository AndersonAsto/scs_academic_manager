import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Year } from '../../years/years.model';
import { YearService } from '../../years/years.service';
import { WeightingsService } from '../weightings.service';
import { Weighting } from '../weightings.model';

@Component({
  selector: 'app-update-weighting',
  imports: [ReactiveFormsModule],
  templateUrl: './update-weighting.html',
  styleUrl: './update-weighting.css',
})
export class UpdateWeighting {

  private fb = inject(FormBuilder);
  private weightingService = inject(WeightingsService);
  private yearService = inject(YearService);

  isOpen = input(false);
  weighting = input<Weighting | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  years = signal<Year[]>([]);

  readonly weightingOptions = [
    'Calificación Diaria',
    'Práctica',
    'Examen'
  ];

  form = this.fb.group({
    year_id: this.fb.control<number | null>({ value: null, disabled: true }, Validators.required),
    weighting: this.fb.nonNullable.control(
      { value: 0, disabled: false },
      [Validators.required, Validators.min(1)]
    ),
    type: this.fb.control({ value: '', disabled: true }, Validators.required),
    description: this.fb.control('')
  });

  constructor() {

    this.loadYears();

    effect(() => {

      if (!this.isOpen()) return;

      const weight = this.weighting();

      if (!weight) return;

      this.form.patchValue({
        year_id: weight.year_id,
        weighting: weight.weighting,
        type: weight.type,
        description: weight.description ?? ''
      });

      this.errorMessage = '';

    });

  }

  private loadYears(): void {

    this.yearService.list().subscribe({
      next: years => this.years.set(years)
    });

  }

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {

    if (this.form.invalid || !this.weighting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const value = this.form.getRawValue();

    const payload = {
      weighting: value.weighting!,
      description: value.description || null
    };

    this.weightingService
      .update(this.weighting()!.id, payload)
      .subscribe({

        next: () => {

          this.submitting = false;
          this.saved.emit();

        },

        error: err => {

          this.submitting = false;
          this.errorMessage =
            err?.error?.message ??
            'Ocurrió un error. Inténtalo nuevamente.';

        }

      });

  }
}
