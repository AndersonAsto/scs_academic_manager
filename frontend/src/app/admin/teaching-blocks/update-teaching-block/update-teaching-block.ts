import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { TeachingBlockService } from '../teaching-blocks.service';
import { TeachingBlock } from '../teaching-blocks.model';
import { Year } from '../../years/years.model';
import { YearService } from '../../years/years.service';

@Component({
  selector: 'app-update-teaching-block',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './update-teaching-block.html',
  styleUrl: './update-teaching-block.css',
})
export class UpdateTeachingBlock {
  private fb = inject(FormBuilder);
  private teachingBlockService = inject(TeachingBlockService);
  private yearService = inject(YearService);

  isOpen = input(false);
  teachingBlock = input<TeachingBlock | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  years = signal<Year[]>([]);

  readonly teachingBlockOptions = [
    '1° Bimestre',
    '2° Bimestre',
    '3° Bimestre',
    '4° Bimestre'
  ];

  form = this.fb.group({
    year_id: this.fb.control<number | null>({value: null, disabled: true}, Validators.required),
    teaching_block: this.fb.control({ value: '', disabled: true }, Validators.required),
    start_day: this.fb.control('', Validators.required),
    end_day: this.fb.control('', Validators.required),
    description: this.fb.control('')
  });

  constructor() {

    this.loadYears();

    effect(() => {

      if (!this.isOpen()) return;

      const block = this.teachingBlock();

      if (!block) return;

      this.form.patchValue({
        year_id: block.year_id,
        teaching_block: block.teaching_block,
        start_day: block.start_day,
        end_day: block.end_day,
        description: block.description ?? ''
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

    if (this.form.invalid || !this.teachingBlock()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const value = this.form.getRawValue();

    const payload = {
      start_day: value.start_day!,
      end_day: value.end_day!,
      description: value.description || null
    };

    this.teachingBlockService
      .update(this.teachingBlock()!.id, payload)
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
