import { inject, Injectable } from "@angular/core";
import { User } from "./users.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { map, Observable } from "rxjs";
import { ApiResponse } from "../services/api-response.service";

export interface UpdateUserPayload {
    username: string;
    hashed_password: string;
    role: string;

    description: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/users`;

    list(personalInformationId?: number): Observable<User[]> {
        let params = new HttpParams();
        if (personalInformationId) {
            params = params.set('personal_information_id', personalInformationId.toString());
        }

        return this.http
            .get<ApiResponse<User[]>>(`${this.baseUrl}/list`, { params })
            .pipe(map(response => response.data ?? []));
    }

    update(personalInformationId: number, payload: UpdateUserPayload): Observable<ApiResponse<null>> {
        return this.http.put<ApiResponse<null>>(`${this.baseUrl}/update/${personalInformationId}`, payload);
    }
}