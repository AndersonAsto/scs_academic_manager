import { Component, inject } from '@angular/core';
import { SidebarService } from '../sidebar/sidebar.service';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-parents-layout',
  imports: [RouterOutlet, Sidebar],
  standalone: true,
  templateUrl: './parents-layout.html',
  styleUrl: './parents-layout.css',
})
export class ParentsLayout {
  sidebarService = inject(SidebarService);
}
