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
    {
      title: 'Panel Principal',
      icon: 'fa-solid fa-chart-simple',
      route: '/teacher/dashboard'
    },
    {
      title: 'Registro Académico',
      icon: 'fa-solid fa-arrow-trend-up',
      route: '/teacher/academic-records'
    },
    {
      title: 'Prom. Bloque Lectivo',
      icon: 'fa-solid fa-arrow-trend-up',
      route: '/teacher/teaching-block-course-average'
    },
    {
      title: 'Prom. Curso',
      icon: 'fa-solid fa-arrow-trend-up',
      route: '/teacher/course-average'
    },
    {
      title: 'Prom. General',
      icon: 'fa-solid fa-arrow-trend-up',
      route: '/teacher/general-average'
    },
    { title: 'Comunicados', icon: 'fa-solid fa-bullhorn', route: '/teacher/ads-sent' },
    { title: 'Perfil', icon: 'fa-solid fa-user-gear', route: '/teacher/teacher-profile' }
  ];

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
