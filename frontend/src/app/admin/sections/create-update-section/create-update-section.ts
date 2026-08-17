import { Component, inject, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Section } from '../sections.model';
import { SectionService } from '../sections.service';

@Component({
  selector: 'app-create-update-section',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-update-section.html',
  styleUrl: './create-update-section.css',
})
export class CreateUpdateSection {
  private fb = inject(FormBuilder);
  private sectionService = inject(SectionService);

  isOpen = input<boolean>(false);
  sectionToEdit = input<Section | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  form = this.fb.group({
    section: ['', [Validators.required, Validators.maxLength(2)]],
    description: ['']
  });

  constructor() {
    effect(() => {
      const section = this.sectionToEdit();
      if (this.isOpen()) {
        if (section) {
          this.form.patchValue({
            section: section.section,
            description: section.description ?? ''
          });
        } else {
          this.form.reset({ section: '', description: '' });
        }
        this.errorMessage = '';
      }
    });
  }

  get isEditMode(): boolean {
    return !!this.sectionToEdit();
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
      section: this.form.value.section!.trim(),
      description: this.form.value.description?.trim() || null
    };

    const editing = this.sectionToEdit();

    const request$: Observable<unknown> = editing
      ? this.sectionService.update(editing.id, payload)
      : this.sectionService.create(payload);

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
