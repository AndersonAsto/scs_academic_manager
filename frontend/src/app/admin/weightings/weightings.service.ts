import { ApiResponse } from '../services/api-response.service';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Weighting } from './weightings.model';

export interface WeightingPayload {
    year_id: number;
    weighting: number;
    type: string;
    description: string | null;
}

export interface CreateWeightingsPayload {
    year_id: number;

    weightings: {
        weighting: number;
        type: string;
        description: string | null;
    }[];
}

export interface UpdateWeightingsPayload {
    weighting: number;
    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class WeightingsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/weightings`;

    list(): Observable<Weighting[]> {
        return this.http
            .get<ApiResponse<Weighting[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    create(payload: CreateWeightingsPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: UpdateWeightingsPayload): Observable<Weighting> {
        return this.http.put<Weighting>(`${this.baseUrl}/update/${id}`, payload);
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