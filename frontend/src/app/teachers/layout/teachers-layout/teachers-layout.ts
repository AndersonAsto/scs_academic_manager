import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-teachers-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './teachers-layout.html',
  styleUrl: './teachers-layout.css',
})
export class TeachersLayout {
  sidebarService = inject(SidebarService);
}
