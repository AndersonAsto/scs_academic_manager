import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeachingBlock } from './teaching-blocks.model';
import { ApiResponse } from '../services/api-response.service';

export interface TeachingBlockPayload {
    year_id: number,
    teaching_block: string,
    start_day: string,
    end_day: string,
    description: string | null;
};

export interface CreateTeachingBlocksPayload {
    year_id: number;

    teaching_blocks: {
        teaching_block: string;
        start_day: string;
        end_day: string;
        description: string | null;
    }[];
}

export interface UpdateTeachingBlocksPayload {
    start_day: string,
    end_day: string,
    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class TeachingBlockService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/teaching-blocks`;

    list(): Observable<TeachingBlock[]> {
        return this.http
            .get<ApiResponse<TeachingBlock[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    create(payload: CreateTeachingBlocksPayload): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
    }

    update(id: number, payload: UpdateTeachingBlocksPayload): Observable<TeachingBlock> {
        return this.http.put<TeachingBlock>(`${this.baseUrl}/update/${id}`, payload);
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