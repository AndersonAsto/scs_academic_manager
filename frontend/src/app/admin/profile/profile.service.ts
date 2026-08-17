import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../services/api-response.service';

export interface PersonalInformation {
  id: number;
  names: string;
  fathers_surname: string;
  mothers_surname: string;
  dni: string;
  email: string;
  phone_number: string;
  address: string | null;
  district: string | null;
  province: string | null;
  department: string | null;
  gender: 'M' | 'F' | null;
}

export interface ProfileData {
  id: number;
  username: string | null;
  role: string;
  profile_picture: string | null;
  personalInformation: PersonalInformation;
}

export interface UpdateProfilePayload {
  username?: string;
  password?: string;
  email?: string;
  phone_number?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async getMyProfile(): Promise<ProfileData> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<ProfileData>>(`${this.base}/users/me/profile`),
    );
    return res.data;
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<void> {
    await firstValueFrom(this.http.put(`${this.base}/users/me/profile`, payload));
  }

  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const res = await firstValueFrom(
      this.http.post<{ profile_picture: string }>(`${this.base}/users/me/profile-picture`, formData),
    );

    return res.profile_picture;
  }

  resolveImageUrl(path: string | null): string | null {
    if (!path) return null;
    return `${environment.assetsUrl}${path}`;
  }

  async deleteProfilePicture(): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.base}/users/me/profile-picture`));
  }
}