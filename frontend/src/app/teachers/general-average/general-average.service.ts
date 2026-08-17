
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

export interface TeacherGroup {
  id: number;
  course_id: number;
  course: string;
  grade_id: number;
  grade: string;
  section_id: number;
  section: string;
  tutor: boolean;
}

export interface SectionCourse {
  id: number; // teacher_group_id
  course_id: number;
  course: string;
}

export interface StudentRow {
  registration_id: number;
  student_id: number;
  names: string;
  fathers_surname: string;
  mothers_surname: string;
  general_average: number | null;
  hasGeneralAverage: boolean;
}

export interface AcademicRecordDetail {
  school_day: string;
  day: string;
  type: string;
  week_number: number | null;
  teaching_block: string;
  time_slot: string;
  attendance: 'P' | 'J' | 'T' | 'F' | null;
  score: number | null;
  incident: string | null;
}

export interface BlockAverageDetail {
  teaching_block_id: number;
  teaching_block: {
    id: number;
    teaching_block: string;
    start_day?: string;
    end_day?: string;
  } | string;
  daily_average: number | null;
  practice_average: number | null;
  exam_average: number | null;
  attendance_average: number | null;
  teaching_block_average: number | null;
}

@Injectable({ providedIn: 'root' })
export class GeneralAverageService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async getMyContracts(): Promise<Contract[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Contract[]>>(`${this.base}/academic-staff-contracts/mine`),
    );
    return res.data;
  }

  async getTeacherGroups(academicStaffContractId: number): Promise<TeacherGroup[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<TeacherGroup[]>>(`${this.base}/teacher-groups/by-contract`, {
        params: { academic_staff_contract_id: academicStaffContractId },
      }),
    );
    return res.data;
  }

  async getSectionCourses(yearId: number, gradeId: number, sectionId: number): Promise<SectionCourse[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<SectionCourse[]>>(`${this.base}/teacher-groups/by-section`, {
        params: { year_id: yearId, grade_id: gradeId, section_id: sectionId },
      }),
    );
    return res.data;
  }

  async getStudents(yearId: number, gradeId: number, sectionId: number): Promise<StudentRow[]> {
    const res = await firstValueFrom(
      this.http.get<
        ApiResponse<{
          registration_id: number;
          student_id: number;
          names: string;
          fathers_surname: string;
          mothers_surname: string;
        }[]>
      >(`${this.base}/registrations/by-group`, {
        params: { year_id: yearId, grade_id: gradeId, section_id: sectionId },
      }),
    );

    return res.data.map((student) => ({
      ...student,
      general_average: null,
      hasGeneralAverage: false,
    }));
  }

  async getGeneralAverage(registrationId: number): Promise<{ general_average: number | null } | null> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Array<{ registration_id: number; general_average: number | null }>>>(
        `${this.base}/general-average/list`,
        { params: { registration_id: registrationId } },
      ),
    );
    return res.data[0] ?? null;
  }

  async calculateGeneralAverage(registrationId: number) {
    return firstValueFrom(
      this.http.post<{ action: 'created' | 'updated'; data: { general_average: number | null } }>(
        `${this.base}/general-average/create`,
        { registration_id: registrationId },
      ),
    );
  }

  async getAcademicRecords(registrationId: number, teacherGroupId: number): Promise<AcademicRecordDetail[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<AcademicRecordDetail[]>>(`${this.base}/academic-records/by-student-group`, {
        params: { registration_id: registrationId, teacher_group_id: teacherGroupId },
      }),
    );
    return res.data;
  }

  async getBlockAverages(registrationId: number, teacherGroupId: number): Promise<BlockAverageDetail[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<BlockAverageDetail[]>>(
        `${this.base}/teaching-block-course-averages/list`,
        { params: { registration_id: registrationId, teacher_group_id: teacherGroupId } },
      ),
    );
    return res.data;
  }

  async getCourseAverage(registrationId: number, teacherGroupId: number): Promise<number | null> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Array<{ overall_course_average: number | null }>>>(
        `${this.base}/course-average/list`,
        { params: { registration_id: registrationId, teacher_group_id: teacherGroupId } },
      ),
    );
    return res.data[0]?.overall_course_average ?? null;
  }

  async downloadDetailedReport(registrationId: number, yearId: number): Promise<void> {
    const response = await firstValueFrom(
      this.http.get(`${this.base}/academic-records/student-report/excel`, {
        params: {
          registration_id: registrationId,
          year_id: yearId,
        },
        responseType: 'blob',
        observe: 'response', // necesario para poder leer los headers de la respuesta
      }),
    );

    const blob = response.body as Blob;
    const fileName = this.extractFileName(response.headers.get('Content-Disposition')) ?? 'reporte_academico.xlsx';

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  private extractFileName(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;

    // Soporta tanto filename="..." como filename*=UTF-8''... (RFC 5987, por si en el futuro
    // usas caracteres especiales codificados)
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match) return decodeURIComponent(utf8Match[1]);

    const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    return plainMatch ? plainMatch[1] : null;
  }
}