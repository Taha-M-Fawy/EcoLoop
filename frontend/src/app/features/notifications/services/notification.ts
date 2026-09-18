import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';

import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private baseUrl = 'http://localhost:5000/api/notifications';

  // عدد الإشعارات غير المقروءة
  private unreadCountSubject = new BehaviorSubject<number>(0);

  // الـ Navbar والـ Notifications يقدروا يسمعوا للتغيير
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl);
  }

  getUnreadCount(): Observable<number> {
    return this.getNotifications().pipe(
      map(notifications =>
        notifications.filter(notification => !notification.isRead).length
      )
    );
  }

  // تحديث العداد من الـ Backend
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCountSubject.next(count);
      },
      error: () => {
        this.unreadCountSubject.next(0);
      }
    });
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