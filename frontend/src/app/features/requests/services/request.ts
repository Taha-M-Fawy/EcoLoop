import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Request } from '../models/request.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/requests`;

  getRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(this.apiUrl);
  }

  getRequestById(id: string): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/${id}`);
  }

  createRequest(request: Request): Observable<Request> {
    return this.http.post<Request>(this.apiUrl, request);
  }

  updateRequest(id: string, request: Partial<Request>): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/${id}`, request);
  }

  deleteRequest(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
