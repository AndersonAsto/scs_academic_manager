import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../services/api-response.service';

export interface YearItem {
  id: number;
  year: number;
}

export interface GradeSectionCount {
  grade: string;
  section: string;
  count: number;
}

export interface AdminSummary {
  total_students: number;
  total_teachers: number;
  total_registrations: number;
  attendance_rate: number | null;
  general_average: number | null;
  by_grade_section: GradeSectionCount[];
}

export interface CourseBlockAverage {
  teaching_block: string;
  average: number | null;
}

export interface CourseGroupAverage {
  course: string;
  average: number | null; // promedio general del curso (tabla course_average)
  attendance_average: number | null; // fracción 0-1
  blocks: CourseBlockAverage[]; // siempre 4, en orden
}

export interface AdminGroupSummary {
  grade: string;
  section: string;
  attendance_average: number | null;
  general_average: number | null;
  courses: CourseGroupAverage[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async getYears(): Promise<YearItem[]> {
    const res = await firstValueFrom(this.http.get<ApiResponse<YearItem[]>>(`${this.base}/years/list`));
    return res.data;
  }

  async getAdminSummary(yearId: number): Promise<AdminSummary> {
    const res = await firstValueFrom(
      this.http.get<{ data: AdminSummary }>(`${this.base}/dashboard/admin-summary`, {
        params: { year_id: yearId },
      }),
    );
    return res.data;
  }

  async getAdminGroupsSummary(yearId: number): Promise<AdminGroupSummary[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: AdminGroupSummary[] }>(`${this.base}/dashboard/admin-groups-summary`, {
        params: { year_id: yearId },
      }),
    );
    return res.data;
  }
}