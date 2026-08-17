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

export interface ScheduleItem {
  id: number;
  day: string;
  time_slot: string;
  start_time: string;
  end_time: string;
}

export interface LectiveDay {
  id: number; // school_day_by_schedule_id
  date: string;
  day: string;
  week_number: number | null;
  teaching_block: string | null;
  type: string;
}

export interface StudentRow {
  registration_id: number;
  student_id: number;
  names: string;
  fathers_surname: string;
  mothers_surname: string;
  attendance: 'P' | 'J' | 'T' | 'F' | null;
  score: number | null;
  incident: string | null;
  description: string | null;
}

export interface AcademicRecordModel {
  id: number;
  registration_id: number;
  school_day_by_schedule_id: number;
  attendance: 'P' | 'J' | 'T' | 'F' | null;
  score: number | null;
  incident: string | null;
  description: string | null;
  status?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AcademicRecordService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async getMyContracts(): Promise<Contract[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: Contract[] }>(`${this.base}/academic-staff-contracts/mine`),
    );
    return res.data;
  }

  async getTeacherGroups(academicStaffContractId: number): Promise<TeacherGroup[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: TeacherGroup[] }>(`${this.base}/teacher-groups/by-contract`, {
        params: { academic_staff_contract_id: academicStaffContractId },
      }),
    );
    return res.data;
  }

  async getSchedules(teacherGroupId: number): Promise<ScheduleItem[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: ScheduleItem[] }>(`${this.base}/schedules/by-teacher-group`, {
        params: { teacher_group_id: teacherGroupId },
      }),
    );
    return res.data;
  }

  async getLectiveDays(scheduleId: number): Promise<LectiveDay[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: LectiveDay[] }>(`${this.base}/school-days-by-schedule/lective`, {
        params: { schedule_id: scheduleId },
      }),
    );
    return res.data;
  }

  async getStudents(yearId: number, gradeId: number, sectionId: number): Promise<StudentRow[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: Omit<StudentRow, 'attendance' | 'score' | 'incident' | 'description'>[] }>(
        `${this.base}/registrations/by-group`,
        { params: { year_id: yearId, grade_id: gradeId, section_id: sectionId } },
      ),
    );

    return res.data.map((student) => ({
      ...student,
      attendance: null,
      score: null,
      incident: null,
      description: null,
    }));
  }

  // Trae los registros ya guardados de ese día, para precargarlos si el docente vuelve a editar.
  async getExistingRecords(
    schoolDayByScheduleId: number
  ): Promise<AcademicRecordModel[]> {

    const res = await firstValueFrom(
      this.http.get<ApiResponse<AcademicRecordModel[]>>(
        `${this.base}/academic-records/list`,
        {
          params: {
            school_day_by_schedule_id:
              schoolDayByScheduleId
          }
        }
      )
    );

    return res.data;
  }

  async saveRecords(schoolDayByScheduleId: number, records: StudentRow[]) {
    return firstValueFrom(
      this.http.post(`${this.base}/academic-records/create`, {
        school_day_by_schedule_id: schoolDayByScheduleId,
        records: records.map((r) => ({
          registration_id: r.registration_id,
          attendance: r.attendance,
          score: r.score,
          incident: r.incident,
          description: r.description,
        })),
      }),
    );
  }
}