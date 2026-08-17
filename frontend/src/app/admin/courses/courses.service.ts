import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course } from './courses.model';

export interface CoursePayload {
  course: string;
  recurrence: number;
  description: string | null;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/courses`;

  list(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/list`);
  }

  create(payload: CoursePayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload);
  }

  update(id: number, payload: CoursePayload): Observable<Course> {
    return this.http.put<Course>(`${this.baseUrl}/update/${id}`, payload);
  }

  delete(id: number, del: 0 | 1): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/delete/${id}/${del}`);
  }
}