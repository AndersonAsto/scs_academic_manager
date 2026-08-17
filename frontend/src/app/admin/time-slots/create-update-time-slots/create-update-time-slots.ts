import { Component, inject, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { TimeSlot } from '../time-slots.model';
import { TimeSlotService } from '../time-slots.service';

@Component({
  selector: 'app-create-update-time-slots',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-update-time-slots.html',
  styleUrl: './create-update-time-slots.css',
})
export class CreateUpdateTimeSlots {
  private fb = inject(FormBuilder);
  private timeSlotService = inject(TimeSlotService);

  isOpen = input<boolean>(false);
  timeSlotToEdit = input<TimeSlot | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  readonly timeSlotOptions = [
    'Mañana 1',
    'Mañana 2',
    'Receso 1',
    'Tarde 1',
    'Receso 2',
    'Tarde 2'
  ];

  readonly typeOptions = [
    'Clase',
    'Receso'
  ];

  form = this.fb.group({
    time_slot: ['Mañana 1', Validators.required],
    start_time: ['', Validators.required],
    end_time: ['', Validators.required],
    type: ['Clase', Validators.required],
    description: ['']
  });

  constructor() {
    effect(() => {
      const timeSlot = this.timeSlotToEdit();
      if (this.isOpen()) {
        if (timeSlot) {
          this.form.patchValue({
            time_slot: timeSlot.time_slot,
            start_time: timeSlot.start_time,
            end_time: timeSlot.end_time,
            type: timeSlot.type,
            description: timeSlot.description ?? ''
          });
        } else {
          this.form.reset({
            time_slot: 'Mañana 1',
            start_time: '',
            end_time: '',
            type: 'Clase',
            description: ''
          });
        }
        this.errorMessage = '';
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.timeSlotToEdit();
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
      time_slot: this.form.value.time_slot!.trim(),
      start_time: this.form.value.start_time!.trim(),
      end_time: this.form.value.end_time!.trim(),
      type: this.form.value.type!.trim(),
      description: this.form.value.description?.trim() || null
    };

    const editing = this.timeSlotToEdit();

    const request$: Observable<unknown> = editing
      ? this.timeSlotService.update(editing.id, payload)
      : this.timeSlotService.create(payload);

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
