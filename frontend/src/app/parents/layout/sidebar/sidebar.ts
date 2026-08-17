import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from './sidebar.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  sidebarService = inject(SidebarService);
  authService = inject(AuthService);
  
  menu = [
    { title: 'Panel Principal', icon: 'fa-solid fa-chart-simple', route: '/parent/dashboard' },
    { title: 'Registro Académico', icon: 'fa-solid fa-arrow-trend-up', route: '/parent/student-academic-record' },
    { title: 'Comunicados', icon: 'fa-solid fa-bullhorn', route: '/parent/ads-received' },
    { title: 'Perfil', icon: 'fa-solid fa-user-gear', route: '/parent/parent-profile' }
  ];

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
