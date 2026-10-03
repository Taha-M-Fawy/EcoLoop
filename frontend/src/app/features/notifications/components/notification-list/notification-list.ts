import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { Notification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.css'
})
export class NotificationList implements OnInit {

  notifications: Notification[] = [];
  loading = true;
  error = '';
  activeTab: 'all' | 'unread' | 'transaction' | 'review' = 'all';

  private router = inject(Router);

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  get filteredNotifications(): Notification[] {
    if (this.activeTab === 'unread') {
      return this.notifications.filter(n => !n.isRead);
    }
    if (this.activeTab === 'transaction') {
      return this.notifications.filter(n => n.type === 'transaction');
    }
    if (this.activeTab === 'review') {
      return this.notifications.filter(n => n.type === 'review');
    }
    return this.notifications;
  }

  setTab(tab: 'all' | 'unread' | 'transaction' | 'review'): void {
    this.activeTab = tab;
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  // =========================
  // Load Notifications
  // =========================
  loadNotifications(): void {
    this.loading = true;
    this.error = '';

    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
        this.notificationService.refreshUnreadCount();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Notifications ERROR:', err);
        this.error = 'حدث خطأ أثناء تحميل الإشعارات';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleNotificationClick(notification: Notification): void {
    this.markAsRead(notification);

    if (notification.type === 'transaction') {
      this.router.navigate(['/transactions']);
    } else if (notification.type === 'request') {
      this.router.navigate(['/requests']);
    } else if (notification.type === 'review') {
      this.router.navigate(['/profile']);
    } else if (notification.type === 'system' && notification.entityType === 'Item') {
      this.router.navigate(['/items']);
    }
  }

  // =========================
  // Mark Notification As Read
  // =========================
  markAsRead(notification: Notification): void {
    if (notification.isRead || !notification._id) {
      return;
    }

    this.notificationService
      .updateNotification(
        notification._id,
        { isRead: true }
      )
      .subscribe({
        next: (updatedNotification) => {
          const index = this.notifications.findIndex(
            item => item._id === notification._id
          );

          if (index !== -1) {
            this.notifications[index] = { ...this.notifications[index], ...updatedNotification, isRead: true };
          }

          this.notificationService.refreshUnreadCount();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Mark notification as read error:', err);
          this.error = 'حدث خطأ أثناء تحديث الإشعار';
          this.cdr.detectChanges();
        }
      });
  }

  // =========================
  // Delete Notification
  // =========================
  deleteNotification(notification: Notification): void {
    if (!notification._id) {
      return;
    }

    const confirmed = confirm('هل أنت متأكد من حذف هذا الإشعار؟');
    if (!confirmed) {
      return;
    }

    this.notificationService
      .deleteNotification(notification._id)
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(
            item => item._id !== notification._id
          );
          this.notificationService.refreshUnreadCount();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Delete notification error:', err);
          this.error = 'حدث خطأ أثناء حذف الإشعار';
          this.cdr.detectChanges();
        }
      });
  }

  // =========================
  // Mark All Notifications As Read (Single Bulk Request)
  // =========================
  markAllAsRead(): void {
    const hasUnread = this.notifications.some(n => !n.isRead);
    if (!hasUnread) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => ({
          ...n,
          isRead: true
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Mark all as read error:', err);
        this.error = 'حدث خطأ أثناء تحديث الإشعارات';
        this.cdr.detectChanges();
      }
    });
  }

  // =========================
  // Check Unread Notifications
  // =========================
  hasUnreadNotifications(): boolean {
    return this.notifications.some(
      notification => !notification.isRead
    );
  }
}
