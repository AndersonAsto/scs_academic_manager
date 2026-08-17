import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../admin/services/api-response.service'; // ajusta la ruta a donde la tengas

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

export interface TeachingBlockItem {
    id: number;
    teaching_block: string; // '1° Bimestre', etc.
    start_day: string;
    end_day: string;
}

export interface AverageValues {
    daily_average: number | null;
    practice_average: number | null;
    exam_average: number | null;
    attendance_average: number | null;
    teaching_block_average: number | null;
}

export interface StudentAverageRow extends AverageValues {
    registration_id: number;
    student_id: number;
    names: string;
    fathers_surname: string;
    mothers_surname: string;
    hasRecord: boolean;
}

@Injectable({ providedIn: 'root' })
export class TeachingBlockCourseAverageService {
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

    async getTeachingBlocks(yearId: number): Promise<TeachingBlockItem[]> {
        const res = await firstValueFrom(
            this.http.get<ApiResponse<TeachingBlockItem[]>>(`${this.base}/teaching-blocks/by-year`, {
                params: { year_id: yearId },
            }),
        );
        return res.data;
    }

    async getStudents(
        yearId: number,
        gradeId: number,
        sectionId: number
    ): Promise<StudentAverageRow[]> {

        const res = await firstValueFrom(
            this.http.get<
                ApiResponse<{
                    registration_id: number;
                    student_id: number;
                    names: string;
                    fathers_surname: string;
                    mothers_surname: string;
                }[]>
            >(
                `${this.base}/registrations/by-group`,
                {
                    params: {
                        year_id: yearId,
                        grade_id: gradeId,
                        section_id: sectionId
                    }
                }
            )
        );

        return res.data.map((student) => ({
            ...student,
            daily_average: null,
            practice_average: null,
            exam_average: null,
            attendance_average: null,
            teaching_block_average: null,
            hasRecord: false
        }));
    }

    async getExistingAverages(teacherGroupId: number, teachingBlockId: number) {
        const res = await firstValueFrom(
            this.http.get<ApiResponse<Array<AverageValues & { registration_id: number }>>>(
                `${this.base}/teaching-block-course-averages/list`,
                { params: { teacher_group_id: teacherGroupId, teaching_block_id: teachingBlockId } },
            ),
        );
        return res.data;
    }

    async calculate(registrationId: number, teacherGroupId: number, teachingBlockId: number) {
        return firstValueFrom(
            this.http.post<{ action: 'created' | 'updated'; data: AverageValues & { registration_id: number } }>(
                `${this.base}/teaching-block-course-averages/create`,
                {
                    registration_id: registrationId,
                    teacher_group_id: teacherGroupId,
                    teaching_block_id: teachingBlockId,
                },
            ),
        );
    }
}