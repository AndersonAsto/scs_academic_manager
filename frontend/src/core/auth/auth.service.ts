import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { resolveAssetUrl } from '../utils/assets';

export type Role = 'Administrador' | 'Docente' | 'Estudiante' | 'Apoderado';

export interface SessionUser {
  id: number;
  username: string;
  role: Role;
  profile_picture: string | null;
  personalInformation: PersonalInformation | null;
  roleProfile: Record<string, any> | null;
}

export interface PersonalInformation {
  id: number;
  names: string;
  fathers_surname: string;
  mothers_surname: string;
}

const ROLE_HOME: Record<Role, string> = {
  Administrador: '/admin/dashboard',
  Docente: '/teacher/dashboard',
  Apoderado: '/parent/dashboard',
  Estudiante: '/student/dashboard',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  avatarUrl = computed(() => resolveAssetUrl(this.user()?.profile_picture ?? null));

  private accessToken = signal<string | null>(null);
  private user = signal<SessionUser | null>(null);

  isAuthenticated = computed(() => !!this.accessToken() && !!this.user());
  currentUser = computed(() => this.user());
  role = computed(() => this.user()?.role ?? null);

  getAccessToken(): string | null {
    return this.accessToken();
  }

  homeRouteForRole(role: Role): string {
    return ROLE_HOME[role];
  }

  async login(username: string, password: string): Promise<SessionUser> {
    const response = await firstValueFrom(
      this.http.post<{ accessToken: string; user: SessionUser }>(
        `${environment.apiUrl}/auth/login`,
        { username, password },
        { withCredentials: true },
      ),
    );

    this.accessToken.set(response.accessToken);
    this.user.set(response.user);

    return response.user;
  }

  // Se llama al iniciar la app: intenta renovar sesión usando la cookie httpOnly.
  async tryRestoreSession(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ accessToken: string; user: SessionUser }>(
          `${environment.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        ),
      );

      this.accessToken.set(response.accessToken);
      this.user.set(response.user);
      return true;
    } catch {
      this.accessToken.set(null);
      this.user.set(null);
      return false;
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ accessToken: string; user: SessionUser }>(
          `${environment.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        ),
      );

      this.accessToken.set(response.accessToken);
      this.user.set(response.user);
      return response.accessToken;
    } catch {
      this.clearSession();
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }),
      );
    } finally {
      this.clearSession();
      this.router.navigate(['/login']);
    }
  }

  private clearSession(): void {
    this.accessToken.set(null);
    this.user.set(null);
  }

  displayName = computed(() => {
    const personalInformation = this.user()?.personalInformation;

    if (!personalInformation) {
      return '';
    }

    const names = personalInformation.names.trim().split(/\s+/);

    const firstName = names[0] ?? '';
    const secondNameInitial = names[1]
      ? ` ${names[1].charAt(0).toUpperCase()}.`
      : '';

    return [
      `${firstName}${secondNameInitial}`,
      personalInformation.fathers_surname,
      personalInformation.mothers_surname,
    ]
      .filter(Boolean)
      .join(' ');
  });

  async refreshCurrentUser(): Promise<void> {
    const response = await firstValueFrom(
      this.http.get<{ user: SessionUser }>(`${environment.apiUrl}/auth/me`, { withCredentials: true }),
    );
    this.user.set(response.user);
  }
}