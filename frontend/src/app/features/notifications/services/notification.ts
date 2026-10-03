import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, timer, Subscription } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { Notification } from '../models/notification.model';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private baseUrl = `${environment.apiUrl}/notifications`;
  private toast = inject(ToastService);

  // عدد الإشعارات غير المقروءة
  private unreadCountSubject = new BehaviorSubject<number>(0);

  // الـ Navbar والـ Notifications يقدروا يسمعوا للتغيير
  unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingSub: Subscription | null = null;
  private previousCount: number = -1;

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  startPolling(): void {
    if (this.pollingSub) return;

    // استطلاع دوري ذكي كل 10 ثوانٍ لجلب الإشعارات فور وصولها
    this.pollingSub = timer(1000, 10000).pipe(
      switchMap(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          return of(0);
        }
        return this.getUnreadCount();
      })
    ).subscribe((count) => {
      const oldCount = this.unreadCountSubject.value;
      this.unreadCountSubject.next(count);

      // لو زاد عدد الإشعارات والمستخدم متصل، نظهر له Toast فوري
      if (this.previousCount !== -1 && count > oldCount && count > 0) {
        this.getNotifications().subscribe((notifs) => {
          const latest = notifs[0];
          if (latest && !latest.isRead) {
            this.toast.info(`🔔 ${latest.title || 'إشعار جديد'}: ${latest.message}`);
          }
        });
      }
      this.previousCount = count;
    });
  }

  stopPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
  }

  getNotifications(): Observable<Notification[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of([]);
    }
    return this.http.get<Notification[]>(this.baseUrl).pipe(
      catchError(() => of([]))
    );
  }

  getUnreadCount(): Observable<number> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(0);
    }
    return this.http.get<{ unreadCount: number }>(`${this.baseUrl}/unread-count`).pipe(
      map(res => res?.unreadCount ?? 0),
      catchError(() => of(0))
    );
  }

  // تحديث العداد من الـ Backend
  refreshUnreadCount(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.unreadCountSubject.next(0);
      this.previousCount = 0;
      return;
    }

    this.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCountSubject.next(count);
        this.previousCount = count;
      },
      error: () => {
        this.unreadCountSubject.next(0);
      }
    });
  }

  // وضع علامة مقروء على كافة الإشعارات دفعة واحدة بطلب واحد سريع
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.baseUrl}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      }),
      catchError((err) => {
        return of(err);
      })
    );
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