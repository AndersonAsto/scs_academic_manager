import { inject, Injectable } from "@angular/core";
import { Student } from "./students.model";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ApiResponse } from "../../services/api-response.service";
import { map, Observable } from "rxjs";

export interface UpdateStudentPayload {
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
export class StudentsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/students`;

    list(): Observable<Student[]> {
        return this.http
            .get<ApiResponse<Student[]>>(`${this.baseUrl}/list`)
            .pipe(map(response => response.data));
    }

    update(id: number, payload: UpdateStudentPayload): Observable<Student> {
        return this.http.put<Student>(`${this.baseUrl}/update/${id}`, payload);
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