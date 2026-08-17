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

export interface CourseBlockAverage {
  teaching_block: string;
  average: number | null;
}

export interface ParentSectionCourseSummary {
  course: string;
  blocks: CourseBlockAverage[];
  attendance_average: number | null;
}

export interface ParentDashboardSummary {
  grade: string;
  section: string;
  student_general_average: number | null;
  section_attendance_average: number | null;
  section_general_average: number | null;
  courses: ParentSectionCourseSummary[];
}

@Injectable({ providedIn: 'root' })
export class ParentDashboardService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async getMyChildren(): Promise<ChildRegistration[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<ChildRegistration[]>>(`${this.base}/registrations/my-children`),
    );
    return res.data;
  }

  async getSummary(registrationId: number): Promise<ParentDashboardSummary> {
    const res = await firstValueFrom(
      this.http.get<{ data: ParentDashboardSummary }>(`${this.base}/dashboard/parent-summary`, {
        params: { registration_id: registrationId },
      }),
    );
    return res.data;
  }
}