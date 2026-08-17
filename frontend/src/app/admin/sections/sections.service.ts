import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Section } from './sections.model';

export interface SectionPayload {
    section: string,
    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class SectionService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/sections`;

    list(): Observable<Section[]> {
        return this.http.get<Section[]>(`${this.baseUrl}/list`);
    }

    create(payload: SectionPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: SectionPayload): Observable<Section> {
        return this.http.put<Section>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(id: number, del: 0 | 1): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${id}/${del}`);
    }
}