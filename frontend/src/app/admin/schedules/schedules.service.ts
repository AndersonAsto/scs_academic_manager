import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../services/api-response.service';
import { Schedule } from './schedules.model';

export interface SchedulePayload {
    teacher_group_id: number;
    time_slot_id: number;
    day: string;
    description: string | null;
}

export interface ScheduleReportItem {
    id: number;

    day: string;

    description: string | null;

    time_slot: {
        id: number;
        time_slot: string | null;
        start_time: string | null;
        end_time: string | null;
    };

    course: {
        id: number;
        course: string | null;
    };

    teacher_group: {
        id: number;
        tutor: boolean;

        grade: {
            id: number;
            grade: string | null;
        };

        section: {
            id: number;
            section: string | null;
        };

        academic_staff_contract: {
            year: {
                id: number;
                year: number | string | null;
            };

            academic_staff: {
                personal_information: {
                    names: string | null;
                    fathers_surname: string | null;
                    mothers_surname: string | null;
                };
            };
        };
    };
}

export interface ScheduleReportResponse {
    length: number;
    data: ScheduleReportItem[];
}

@Injectable({ providedIn: 'root' })
export class SchedulesService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/schedules`;

    list(): Observable<Schedule[]> {
        return this.http
            .get<ApiResponse<Schedule[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    create(payload: SchedulePayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: SchedulePayload): Observable<Schedule> {
        return this.http.put<Schedule>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(id: number, del: 0 | 1): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${id}/${del}`);
    }

    getScheduleReport(
        yearId: number,
        gradeId: number,
        sectionId: number
    ): Observable<ScheduleReportResponse> {

        return this.http.get<ScheduleReportResponse>(
            `${this.baseUrl}/report`,
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