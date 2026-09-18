import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private baseUrl = 'http://localhost:5000/api/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl);
  }

  getNotificationById(id: string): Observable<Notification> {
    return this.http.get<Notification>(
      `${this.baseUrl}/${id}`
    );
  }

  createNotification(
    notification: Partial<Notification>
  ): Observable<Notification> {

    return this.http.post<Notification>(
      this.baseUrl,
      notification
    );
  }

  updateNotification(
    id: string,
    notification: Partial<Notification>
  ): Observable<Notification> {

    return this.http.put<Notification>(
      `${this.baseUrl}/${id}`,
      notification
    );
  }

  deleteNotification(
    id: string
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${id}`
    );
  }
}