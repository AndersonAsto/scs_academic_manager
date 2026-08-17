import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../services/api-response.service';
import { AcademicStaffContract } from './academic-staff-contracts.model';

export interface UpdateAcademicContractPayload {
    start_date: string;
    end_date: string;
    position: string;

    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class AcademicStaffContractsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/academic-staff-contracts`;

    list(academicStaffId?: number): Observable<AcademicStaffContract[]> {
        let params = new HttpParams();
        if (academicStaffId) {
            params = params.set('academic_staff_id', academicStaffId.toString());
        }

        return this.http
            .get<ApiResponse<AcademicStaffContract[]>>(`${this.baseUrl}/list`, { params })
            .pipe(map(response => response.data ?? []));
    }

    update(id: number, payload: UpdateAcademicContractPayload): Observable<AcademicStaffContract> {
        return this.http.put<AcademicStaffContract>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(
        id: number,
        del: 0 | 1
    ): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(
            `${this.baseUrl}/delete/${id}/${del}`
        );
    }
}