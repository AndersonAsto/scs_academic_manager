import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ApiResponse } from "../../services/api-response.service";
import { map, Observable } from "rxjs";
import { Parent } from "./parents.model";

export interface UpdateParentPayload {
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
export class ParentsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/parents`;

    list(): Observable<Parent[]> {
        return this.http
            .get<ApiResponse<Parent[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    update(id: number, payload: UpdateParentPayload): Observable<Parent> {
        return this.http.put<Parent>(`${this.baseUrl}/update/${id}`, payload);
    }

    delete(
        id: number,
        del: 0 | 1
    ): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(
            `${this.baseUrl}/delete/${id}/${del}`
        );
    }

    restore(
        id: number
    ): Observable<{ message: string }> {
        return this.http.patch<{ message: string }>(
            `${this.baseUrl}/restore/${id}`,
            {}
        );
    }
}