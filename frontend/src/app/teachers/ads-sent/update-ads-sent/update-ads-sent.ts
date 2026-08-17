import {
  Component,
  effect,
  inject,
  input,
  output
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Announcement } from '../ads-sent.model';
import {
  AnnouncementsService,
  UpdateAnnouncementPayload
} from '../ads-sent.service';

@Component({
  selector: 'app-update-ads-sent',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './update-ads-sent.html',
  styleUrl: './update-ads-sent.css',
})
export class UpdateAdsSent {

  isOpen = input(false);
  announcement = input<Announcement | null>(null);

  closeModal = output<void>();
  updated = output<Announcement>();

  private fb = inject(FormBuilder);
  private announcementsService = inject(AnnouncementsService);

  submitting = false;
  errorMessage = '';

  form = this.fb.group({
    type: this.fb.control<Announcement['type']>('Avisos', {
      validators: [Validators.required]
    }),

    priority: this.fb.control<Announcement['priority']>(null),

    affair: this.fb.control('', {
      validators: [Validators.required]
    }),

    registration_date: this.fb.control('', {
      validators: [Validators.required]
    }),

    description: this.fb.control('')
  });

  constructor() {
    effect(() => {
      const announcement = this.announcement();

      if (!this.isOpen() || !announcement) {
        return;
      }

      this.form.reset({
        type: announcement.type,
        priority: announcement.priority,
        affair: announcement.affair,
        registration_date: this.toDatetimeLocal(
          announcement.registration_date
        ),
        description: announcement.description ?? ''
      });

      this.errorMessage = '';
      this.submitting = false;
    });
  }

  private toDatetimeLocal(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    const announcement = this.announcement();

    if (!announcement) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: UpdateAnnouncementPayload = {
      type: this.form.value.type!,
      priority: this.form.value.priority || null,
      affair: this.form.value.affair!.trim(),
      registration_date: this.form.value.registration_date!,
      description: this.form.value.description?.trim() || null
    };

    this.submitting = true;
    this.errorMessage = '';

    this.announcementsService.update(
      announcement.id,
      payload
    ).subscribe({
      next: (response) => {
        this.submitting = false;
        this.updated.emit(response.data);
      },

      error: err => {
        this.submitting = false;

        this.errorMessage =
          err?.error?.message ??
          'Ocurrió un error al actualizar el comunicado.';
      }
    });
  }
}