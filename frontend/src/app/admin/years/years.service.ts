import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Year } from './years.model';
import { ApiResponse } from '../services/api-response.service';

export interface YearPayload {
    year: number,
    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class YearService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/years`;

    list(): Observable<Year[]> {
        return this.http
            .get<ApiResponse<Year[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    create(payload: YearPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: YearPayload): Observable<Year> {
        return this.http.put<Year>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(id: number, del: 0 | 1): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${id}/${del}`);
    }
}