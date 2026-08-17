import { Injectable, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TimeSlot } from './time-slots.model';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../services/api-response.service';

export interface TimeSlotPayload {
    time_slot: string;
    start_time: string;
    end_time: string;
    type: string;
    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class TimeSlotService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/time-slots`;

    list(): Observable<TimeSlot[]> {
        return this.http
            .get<ApiResponse<TimeSlot[]>>(`${this.baseUrl}/list`)
            .pipe(
                map(response => response.data)
            );
    }

    create(payload: TimeSlotPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: TimeSlotPayload): Observable<TimeSlot> {
        return this.http.put<TimeSlot>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(id: number, del: 0 | 1): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${id}/${del}`);
    }
}