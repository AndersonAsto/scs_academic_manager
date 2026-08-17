import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeachingBlockService } from '../teaching-blocks.service';
import { Year } from '../../years/years.model';
import { YearService } from '../../years/years.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-create-teaching-blocks',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-teaching-blocks.html',
  styleUrl: './create-teaching-blocks.css'
})
export class CreateTeachingBlocks {

  private fb = inject(FormBuilder);
  private teachingBlockService = inject(TeachingBlockService);

  private yearService = inject(YearService);

  years = signal<Year[]>([]);

  isOpen = input(false);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  readonly teachingBlockOptions = [
    '1° Bimestre',
    '2° Bimestre',
    '3° Bimestre',
    '4° Bimestre'
  ];

  form = this.fb.group({

    year_id: this.fb.control<number | null>(null, Validators.required),

    start_day_0: this.fb.control('', Validators.required),
    end_day_0: this.fb.control('', Validators.required),
    description_0: this.fb.control(''),

    start_day_1: this.fb.control('', Validators.required),
    end_day_1: this.fb.control('', Validators.required),
    description_1: this.fb.control(''),

    start_day_2: this.fb.control('', Validators.required),
    end_day_2: this.fb.control('', Validators.required),
    description_2: this.fb.control(''),

    start_day_3: this.fb.control('', Validators.required),
    end_day_3: this.fb.control('', Validators.required),
    description_3: this.fb.control('')

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
      teaching_blocks: [
        {
          teaching_block: '1° Bimestre',
          start_day: value.start_day_0!,
          end_day: value.end_day_0!,
          description: value.description_0 || null
        },
        {
          teaching_block: '2° Bimestre',
          start_day: value.start_day_1!,
          end_day: value.end_day_1!,
          description: value.description_1 || null
        },
        {
          teaching_block: '3° Bimestre',
          start_day: value.start_day_2!,
          end_day: value.end_day_2!,
          description: value.description_2 || null
        },
        {
          teaching_block: '4° Bimestre',
          start_day: value.start_day_3!,
          end_day: value.end_day_3!,
          description: value.description_3 || null
        }
      ]
    };

    this.teachingBlockService.create(payload).subscribe({

      next: () => {
        this.submitting = false;
        this.saved.emit();

        this.form.reset({
          year_id: null,
          start_day_0: '',
          end_day_0: '',
          description_0: '',
          start_day_1: '',
          end_day_1: '',
          description_1: '',
          start_day_2: '',
          end_day_2: '',
          description_2: '',
          start_day_3: '',
          end_day_3: '',
          description_3: ''
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