import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../services/api-response.service';
import { AcademicStaffModel } from './academic-staff.model';

export interface AcademicStaffPayload {
    personal_information_id: number;
    staff_type: string;
    description: string | null;
}

export interface SaveAcademicStaffPayload {

    academic_staff_id?: number;

    names?: string;
    fathers_surname?: string;
    mothers_surname?: string;
    dni?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    district?: string;
    province?: string;
    department?: string;
    gender?: string;

    role: string;
    position: string;

    start_date: string;
    end_date: string;

    description: string | null;

}

export interface UpdateAcademicStaffPayload {

    staff_type: string;

    names: string;
    fathers_surname: string;
    mothers_surname: string;

    dni: string;
    email: string;
    phone_number: string;

    address: string;
    district: string;
    province: string;
    department: string;

    gender: string;

    description: string | null;

}

@Injectable({ providedIn: 'root' })
export class AcademicStaffService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/academic-staff`;

    list(): Observable<AcademicStaffModel[]> {
        return this.http
            .get<ApiResponse<AcademicStaffModel[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    create(payload: SaveAcademicStaffPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: UpdateAcademicStaffPayload): Observable<AcademicStaffModel> {
        return this.http.put<AcademicStaffModel>(`${this.baseUrl}/update/${id}`, payload);
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