import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../services/api-response.service';

export interface PersonName {
  names: string;
  fathers_surname: string;
  mothers_surname: string;
}

export interface CourseBlockAverage {
  teaching_block: string;
  daily_average: number | null;
  practice_average: number | null;
  exam_average: number | null;
  attendance_average: number | null;
  teaching_block_average: number | null;
}

export interface CourseReportRow {
  teacher_group_id: number;
  course: string;
  blocks: CourseBlockAverage[]; // siempre 4, en orden, null si no existe cálculo
  overall_course_average: number | null;
}

export interface AnnualReportData {
  year: number;
  grade: string;
  section: string;
  student: PersonName;
  tutor: PersonName | null;
  courses: CourseReportRow[];
  general_average: number | null;
}

@Injectable({ providedIn: 'root' })
export class AnnualReportService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async getAnnualReportData(
    registrationId: number,
    yearId: number,
    gradeId: number,
    sectionId: number,
    student: PersonName,
    grade: string,
    section: string,
    year: number,
  ): Promise<AnnualReportData> {
    const [teachingBlocks, sectionCourses, tutor, generalAverage] = await Promise.all([
      this.getTeachingBlocks(yearId),
      this.getSectionCourses(yearId, gradeId, sectionId),
      this.getTutor(yearId, gradeId, sectionId),
      this.getGeneralAverage(registrationId),
    ]);

    const courses: CourseReportRow[] = await Promise.all(
      sectionCourses.map(async (course) => {
        const [blockAverages, overallAverage] = await Promise.all([
          this.getBlockAverages(registrationId, course.id),
          this.getCourseAverage(registrationId, course.id),
        ]);

        const blockByTeachingBlockId = new Map(blockAverages.map((b) => [b.teaching_block_id, b]));

        const blocks: CourseBlockAverage[] = teachingBlocks.map((tb) => {
          const record = blockByTeachingBlockId.get(tb.id);
          return {
            teaching_block: tb.teaching_block,
            daily_average: record?.daily_average ?? null,
            practice_average: record?.practice_average ?? null,
            exam_average: record?.exam_average ?? null,
            attendance_average: record?.attendance_average ?? null,
            teaching_block_average: record?.teaching_block_average ?? null,
          };
        });

        return {
          teacher_group_id: course.id,
          course: course.course,
          blocks,
          overall_course_average: overallAverage,
        };
      }),
    );

    return {
      year,
      grade,
      section,
      student,
      tutor,
      courses,
      general_average: generalAverage,
    };
  }

  private async getTeachingBlocks(yearId: number) {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Array<{ id: number; teaching_block: string }>>>(
        `${this.base}/teaching-blocks/by-year`,
        { params: { year_id: yearId } },
      ),
    );
    return res.data;
  }

  private async getSectionCourses(yearId: number, gradeId: number, sectionId: number) {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Array<{ id: number; course_id: number; course: string }>>>(
        `${this.base}/teacher-groups/by-section`,
        { params: { year_id: yearId, grade_id: gradeId, section_id: sectionId } },
      ),
    );
    return res.data;
  }

  private async getTutor(yearId: number, gradeId: number, sectionId: number): Promise<PersonName | null> {
    const res = await firstValueFrom(
      this.http.get<{ data: PersonName | null }>(`${this.base}/teacher-groups/tutor-by-section`, {
        params: { year_id: yearId, grade_id: gradeId, section_id: sectionId },
      }),
    );
    return res.data;
  }

  private async getGeneralAverage(registrationId: number): Promise<number | null> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Array<{ general_average: number | null }>>>(`${this.base}/general-average/list`, {
        params: { registration_id: registrationId },
      }),
    );
    return res.data[0]?.general_average ?? null;
  }

  private async getBlockAverages(registrationId: number, teacherGroupId: number) {
    const res = await firstValueFrom(
      this.http.get<
        ApiResponse<
          Array<{
            teaching_block_id: number;
            daily_average: number | null;
            practice_average: number | null;
            exam_average: number | null;
            attendance_average: number | null;
            teaching_block_average: number | null;
          }>
        >
      >(`${this.base}/teaching-block-course-averages/list`, {
        params: { registration_id: registrationId, teacher_group_id: teacherGroupId },
      }),
    );
    return res.data;
  }

  private async getCourseAverage(registrationId: number, teacherGroupId: number): Promise<number | null> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Array<{ overall_course_average: number | null }>>>(`${this.base}/course-average/list`, {
        params: { registration_id: registrationId, teacher_group_id: teacherGroupId },
      }),
    );
    return res.data[0]?.overall_course_average ?? null;
  }
}