import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../services/api-response.service';
import { Registration } from './registration.model';
import { PersonalInformationPayload } from '../personal-information/personal-information.service';

export interface RegistrationPayload {
    year_id: number;
    student_id: number;
    parent_id: number;
    grade_id: number;
    section_id: number;
    registration_date: string;

    description: string | null;
}

export interface SaveRegistrationPayload {
    year_id: number;
    grade_id: number;
    section_id: number;
    registration_date: string;
    description: string | null;

    parent_id?: number;
    student_id?: number;

    parent?: PersonalInformationPayload;
    student?: PersonalInformationPayload;
}

export interface UpdateRegistrationPayload {
    year_id: number;
    grade_id: number;
    section_id: number;
    parent_id: number;
    registration_date: string;
    description: string | null;
}


@Injectable({ providedIn: 'root' })
export class RegistrationsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/registrations`;

    list(): Observable<Registration[]> {
        return this.http
            .get<ApiResponse<Registration[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    create(payload: SaveRegistrationPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: UpdateRegistrationPayload): Observable<Registration> {
        return this.http.put<Registration>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(id: number, del: 0 | 1): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${id}/${del}`);
    }

    restore(id: number): Observable<{ message: string }> {
        return this.http.patch<{ message: string }>(
            `${this.baseUrl}/restore/${id}`,
            {}
        );
    }
}