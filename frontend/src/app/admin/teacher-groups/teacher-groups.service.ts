import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../services/api-response.service';
import { TeacherGroup } from './teacher-groups.model';

export interface TeacherGroupPayload {
    academic_staff_contract_id: number;
    course_id: number;
    grade_id: number;
    section_id: number;
    tutor: boolean;
    description: string | null;
}

export interface TutorStudentReport {
    registration_id: number;
    student_id: number;
    names: string;
    fathers_surname: string;
    mothers_surname: string;
    dni?: string | null;
    email?: string | null;
    phone_number?: string | null;
    status: boolean;
}

export interface TutorGroupReport {
    teacher_group: TeacherGroup;
    students: TutorStudentReport[];
}

@Injectable({ providedIn: 'root' })
export class TeacherGroupsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/teacher-groups`;

    list(): Observable<TeacherGroup[]> {
        return this.http
            .get<ApiResponse<TeacherGroup[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    create(payload: TeacherGroupPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: TeacherGroupPayload): Observable<TeacherGroup> {
        return this.http.put<TeacherGroup>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(id: number, del: 0 | 1): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${id}/${del}`);
    }

    getTutorGroupReport(
        yearId: number,
        gradeId: number,
        sectionId: number
    ) {
        return this.http.get<{
            length: number;
            data: TutorGroupReport;
        }>(
            `${this.baseUrl}/tutor-report`,
            {
                params: {
                    year_id: yearId,
                    grade_id: gradeId,
                    section_id: sectionId
                }
            }
        );
    }
}