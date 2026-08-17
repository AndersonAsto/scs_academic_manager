import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Grade } from './grades.model';

export interface GradePayload {
    grade: string,
    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class GradeService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/grades`;

    list(): Observable<Grade[]> {
        return this.http.get<Grade[]>(`${this.baseUrl}/list`);
    }

    create(payload: GradePayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: GradePayload): Observable<Grade> {
        return this.http.put<Grade>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(id: number, del: 0 | 1): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${id}/${del}`);
    }
}