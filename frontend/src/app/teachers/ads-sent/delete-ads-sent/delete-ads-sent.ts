import { Component, inject, input, output, signal } from '@angular/core';
import { Announcement } from '../ads-sent.model';
import { AnnouncementsService } from '../ads-sent.service';

@Component({
  selector: 'app-delete-ads-sent',
  standalone: true,
  imports: [],
  templateUrl: './delete-ads-sent.html',
  styleUrl: './delete-ads-sent.css',
})
export class DeleteAdsSent {

  private announcementsService = inject(AnnouncementsService);

  isOpen = input(false);
  announcement = input<Announcement | null>(null);

  closeModal = output<void>();
  deleted = output<void>();

  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  onClose(): void {
    if (this.submitting()) return;

    this.errorMessage.set(null);
    this.closeModal.emit();
  }

  onDelete(del: 0 | 1): void {

    const announcement = this.announcement();

    if (!announcement) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.announcementsService.delete(
      announcement.id,
      del
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.deleted.emit();
      },

      error: err => {
        this.submitting.set(false);

        this.errorMessage.set(
          err?.error?.message ??
          'No se pudo realizar la operación. Inténtelo nuevamente.'
        );
      }
    });
  }
}