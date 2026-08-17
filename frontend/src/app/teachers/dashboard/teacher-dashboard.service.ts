import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../admin/services/api-response.service';

export interface Contract {
  id: number;
  year_id: number;
  year: number;
  position: string | null;
}

export interface CourseBlockAverage {
  teaching_block: string;
  average: number | null;
}

export interface TeacherCourseSummary {
  teacher_group_id: number;
  course: string;
  grade: string;
  section: string;
  tutor: boolean;
  blocks: CourseBlockAverage[];
  attendance_average: number | null;
}

export interface TutorSectionCourseSummary {
  course: string;
  blocks: CourseBlockAverage[];
  attendance_average: number | null;
}

export interface TutorSectionSummary {
  grade: string;
  section: string;
  attendance_average: number | null;
  general_average: number | null;
  courses: TutorSectionCourseSummary[];
}

export interface TeacherDashboardSummary {
  courses: TeacherCourseSummary[];
  tutor_section_summary: TutorSectionSummary | null;
}

@Injectable({ providedIn: 'root' })
export class TeacherDashboardService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async getMyContracts(): Promise<Contract[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Contract[]>>(`${this.base}/academic-staff-contracts/mine`),
    );
    return res.data;
  }

  async getSummary(academicStaffContractId: number): Promise<TeacherDashboardSummary> {
    const res = await firstValueFrom(
      this.http.get<{ data: TeacherDashboardSummary }>(`${this.base}/dashboard/teacher-summary`, {
        params: { academic_staff_contract_id: academicStaffContractId },
      }),
    );
    return res.data;
  }
}