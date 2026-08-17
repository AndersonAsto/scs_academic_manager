import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../services/api-response.service';
import { SchoolDayBySchedule } from './school-days-by-schedules.model';

export interface CreateSchoolDayBySchedulePayload {
    year_id: number;
}

export interface UpdateSchoolDayBySchedulePayload {
    type: string;
    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class SchoolDaysByScheduleService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/school-days-by-schedules`;

    create(payload: CreateSchoolDayBySchedulePayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    list(scheduleId?: number): Observable<SchoolDayBySchedule[]> {
        let params = new HttpParams();
        if (scheduleId) {
            params = params.set('schedule_id', scheduleId.toString());
        }

        return this.http
            .get<ApiResponse<SchoolDayBySchedule[]>>(`${this.baseUrl}/list`, { params })
            .pipe(map(response => response.data ?? []));
    }

    update(id: number, payload: UpdateSchoolDayBySchedulePayload): Observable<SchoolDayBySchedule> {
        return this.http.put<SchoolDayBySchedule>(`${this.baseUrl}/update/${id}`, payload);
    }

    deleteByYear(
        yearId: number,
        del: 0 | 1
    ): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(
            `${this.baseUrl}/delete/${yearId}/${del}`
        );
    }
}