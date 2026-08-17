import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { WeightingsService } from '../weightings.service';
import { YearService } from '../../years/years.service';
import { Year } from '../../years/years.model';

@Component({
  selector: 'app-create-weightings',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-weightings.html',
  styleUrl: './create-weightings.css',
})
export class CreateWeightings {
  readonly typeOptions = [
    'Calificación Diaria', 'Práctica', 'Examen'
  ];

  private fb = inject(FormBuilder);
  private weightingService = inject(WeightingsService);

  private yearService = inject(YearService);

  years = signal<Year[]>([]);

  isOpen = input(false);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  form = this.fb.group({

    year_id: this.fb.control<number | null>(null, Validators.required),

    weighting_0: this.fb.nonNullable.control(30, [
      Validators.required,
      Validators.min(1)
    ]),
    description_0: this.fb.control(''),

    weighting_1: this.fb.nonNullable.control(30, [
      Validators.required,
      Validators.min(1)
    ]),
    description_1: this.fb.control(''),

    weighting_2: this.fb.nonNullable.control(40, [
      Validators.required,
      Validators.min(1)
    ]),
    description_2: this.fb.control('')
  });

  constructor() {
    this.loadYears();
  }

  loadYears(): void {
    this.yearService.list().subscribe({
      next: years => this.years.set(years),
      error: () => {
        this.errorMessage = 'No se pudieron cargar los años.';
      }
    });
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

    const value = this.form.getRawValue();

    const payload = {
      year_id: value.year_id!,
      weightings: [
        {
          weighting: value.weighting_0,
          type: 'Calificación Diaria',
          description: value.description_0 || null
        },
        {
          weighting: value.weighting_1,
          type: 'Práctica',
          description: value.description_1 || null
        },
        {
          weighting: value.weighting_2,
          type: 'Examen',
          description: value.description_2 || null
        }
      ]
    };

    const total =
      Number(value.weighting_0) +
      Number(value.weighting_1) +
      Number(value.weighting_2);

    if (total !== 100) {
      this.submitting = false;
      this.errorMessage =
        `La suma de las ponderaciones debe ser exactamente 100. Total actual: ${total}.`;
      return;
    }

    this.weightingService.create(payload).subscribe({

      next: () => {
        this.submitting = false;
        this.saved.emit();

        this.form.reset({

          year_id: null,

          weighting_0: 30,
          description_0: '',

          weighting_1: 30,
          description_1: '',

          weighting_2: 40,
          description_2: ''

        });

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
