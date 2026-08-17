import { Component, input, output, signal } from '@angular/core';
import { Announcement, GroupedAnnouncements } from '../ads-sent.model';
import { DatePipe } from '@angular/common';
import { UpdateAdsSent } from '../update-ads-sent/update-ads-sent';
import { DeleteAdsSent } from '../delete-ads-sent/delete-ads-sent';

@Component({
  selector: 'app-info-ads-sent',
  imports: [DatePipe, UpdateAdsSent, DeleteAdsSent],
  standalone: true,
  templateUrl: './info-ads-sent.html',
  styleUrl: './info-ads-sent.css',
})
export class InfoAdsSent {

  isOpen = input(false);
  group = input<GroupedAnnouncements | null>(null);

  closeModal = output<void>();
  updated = output<Announcement>();
  deleted = output<void>();

  announcementToEdit = signal<Announcement | null>(null);
  isEditModalOpen = signal(false);

  announcementToDelete = signal<Announcement | null>(null);
  isDeleteModalOpen = signal(false);

  onEdit(announcement: Announcement): void {
    this.announcementToEdit.set(announcement);
    this.isEditModalOpen.set(true);
  }

  onCloseEditModal(): void {
    this.isEditModalOpen.set(false);
    this.announcementToEdit.set(null);
  }

  onUpdated(announcement: Announcement): void {
    this.isEditModalOpen.set(false);
    this.announcementToEdit.set(null);

    this.updated.emit(announcement);
  }

  onDelete(announcement: Announcement): void {
    this.announcementToDelete.set(announcement);
    this.isDeleteModalOpen.set(true);
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.announcementToDelete.set(null);
  }

  onDeleted(): void {
    this.isDeleteModalOpen.set(false);
    this.announcementToDelete.set(null);

    this.deleted.emit();
  }
}