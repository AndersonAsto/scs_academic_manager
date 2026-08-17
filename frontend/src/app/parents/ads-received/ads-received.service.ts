import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../admin/services/api-response.service';

export interface ChildRegistration {
  registration_id: number;
  year_id: number;
  year: number;
  grade_id: number;
  grade: string;
  section_id: number;
  section: string;
  student_id: number;
  names: string;
  fathers_surname: string;
  mothers_surname: string;
}

export interface Announcement {
  id: number;
  teacher_group_id: number;
  registration_id: number;

  type: string;
  priority: string | null;
  affair: string;
  registration_date: string;
  description: string | null;

  reading: boolean;
  status: boolean;

  teacher_group?: {
    id: number;
    course_id: number;
    grade_id: number;
    section_id: number;

    course?: {
      id: number;
      course: string;
    };

    grade?: {
      id: number;
      grade: string;
    };

    section?: {
      id: number;
      section: string;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class AdsReceivedService {

  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async getMyChildren(): Promise<ChildRegistration[]> {

    const res = await firstValueFrom(
      this.http.get<ApiResponse<ChildRegistration[]>>(
        `${this.base}/registrations/my-children`
      )
    );

    return res.data;
  }

  async getAnnouncements(
    registrationId: number
  ): Promise<Announcement[]> {

    const res = await firstValueFrom(
      this.http.get<ApiResponse<Announcement[]>>(
        `${this.base}/announcements/list`,
        {
          params: {
            registration_id: registrationId
          }
        }
      )
    );

    return res.data;
  }

  async markAsRead(id: number): Promise<Announcement> {

    const res = await firstValueFrom(
      this.http.patch<ApiResponse<Announcement>>(
        `${this.base}/announcements/reading/${id}`,
        {}
      )
    );

    return res.data;
  }
}