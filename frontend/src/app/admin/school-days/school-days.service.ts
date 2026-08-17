import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../services/api-response.service';
import { SchoolDay } from './school-days.model';

export interface SchoolDaysPayload {
    teaching_block_id: number;
    school_day: string;
    day: string;
    week_number: number;
    type: string;
    description: string | null;
};

export interface CreateSchoolDaysPayload {
    year_id: number;
}

export interface UpdateSchoolDayPayload {
    type: string,
    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class SchoolDaysService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/school-days`;

    list(): Observable<SchoolDay[]> {
        return this.http
            .get<ApiResponse<SchoolDay[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    create(payload: CreateSchoolDaysPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: UpdateSchoolDayPayload): Observable<SchoolDay> {
        return this.http.put<SchoolDay>(`${this.baseUrl}/update/${id}`, payload);
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