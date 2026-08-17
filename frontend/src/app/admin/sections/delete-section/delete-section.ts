import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { Section } from '../sections.model';
import { SectionService } from '../sections.service';

@Component({
  selector: 'app-delete-section',
  standalone: true,
  imports: [],
  templateUrl: './delete-section.html',
  styleUrl: './delete-section.css',
})
export class DeleteSection {
  private sectionService = inject(SectionService);

  @Input() isOpen = false;
  @Input() section: Section | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  onClose(): void {
    if (this.submitting()) return;

    this.errorMessage.set(null);
    this.closeModal.emit();
  }

  onDelete(del: 0 | 1): void {
    if (!this.section || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.sectionService.delete(this.section.id, del).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },
      error: (error) => {
        this.submitting.set(false);

        this.errorMessage.set(
          error?.error?.message ||
          'No se pudo procesar la eliminación de la sección.'
        );
      }
    });
  }
}