import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SchoolDaysByScheduleService } from '../school-days-by-schedules/school-days-by-schedules.service';
import { YearService } from '../../years/years.service';
import { Year } from '../../years/years.model';

@Component({
  selector: 'app-create-school-days-by-schedules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-school-days-by-schedules.html',
  styleUrl: './create-school-days-by-schedules.css',
})
export class CreateSchoolDaysBySchedules {
  private fb = inject(FormBuilder);
  private yearService = inject(YearService);
  private schoolDaysByScheduleService = inject(SchoolDaysByScheduleService);

  isOpen = input(false);

  closeModal = output<void>();
  saved = output<void>();

  years = signal<Year[]>([]);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    year_id: this.fb.control<number | null>(null, [Validators.required]),
  });

  constructor() {
    this.loadYears();
  }

  private loadYears(): void {
    this.yearService.list().subscribe({
      next: (years) => this.years.set(years),
      error: () => {
        this.errorMessage.set('No se pudieron cargar los años académicos.');
      },
    });
  }

  onBackdropClick(): void {
    this.onCancel();
  }

  onCancel(): void {
    this.errorMessage.set(null);
    this.form.reset({ year_id: null });
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const yearId = this.form.getRawValue().year_id!;

    this.schoolDaysByScheduleService.create({ year_id: yearId }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.form.reset({ year_id: null });
        this.saved.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err?.error?.message ?? 'Ocurrió un error al generar los días lectivos.'
        );
      },
    });
  }
}