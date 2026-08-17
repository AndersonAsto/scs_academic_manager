import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../admin/services/api-response.service';
import { Announcement } from './ads-sent.model';

export interface CreateAnnouncementPayload {
    teacher_group_id: number;
    registration_ids: number[];
    type: string;
    priority?: string | null;
    affair: string;
    registration_date: string;
    description?: string | null;
}

export interface UpdateAnnouncementPayload {
    type: Announcement['type'];
    priority: Announcement['priority'];
    affair: string;
    registration_date: string;
    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/announcements`;

    list(params?: { teacher_group_id?: number; registration_id?: number; type?: string; priority?: string; reading?: 0 | 1 }): Observable<Announcement[]> {
        return this.http
            .get<ApiResponse<Announcement[]>>(`${this.baseUrl}/list`, { params: params as any })
            .pipe(map(response => response.data));
    }

    create(payload: CreateAnnouncementPayload): Observable<{ message: string; length: number; data: Announcement[] }> {
        return this.http.post<{ message: string; length: number; data: Announcement[] }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: UpdateAnnouncementPayload): Observable<{ message: string; data: Announcement }> {
        return this.http.put<{ message: string; data: Announcement }>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(id: number, del: 0 | 1): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${id}/${del}`);
    }
}