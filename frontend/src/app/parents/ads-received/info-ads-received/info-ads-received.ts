import {
  Component,
  input,
  output
} from '@angular/core';

import { DatePipe } from '@angular/common';

import { Announcement } from '../ads-received.service';

@Component({
  selector: 'app-info-ads-received',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './info-ads-received.html',
  styleUrl: './info-ads-received.css',
})
export class InfoAdsReceived {

  isOpen = input(false);

  announcement =
    input<Announcement | null>(null);

  closeModal = output<void>();

  onClose(): void {
    this.closeModal.emit();
  }
}