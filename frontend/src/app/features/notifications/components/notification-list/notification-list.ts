import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Notification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.css'
})
export class NotificationList implements OnInit {

  notifications: Notification[] = [];

  loading = true;
  error = '';

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    console.log('========== NotificationList Started ==========');

    this.loadNotifications();

  }

  loadNotifications(): void {

    console.log('1 - Calling Notifications API...');

    this.notificationService.getNotifications().subscribe({

      next: (data) => {

        console.log(
          '2 - Notifications API RESPONSE:',
          data
        );

        this.notifications = data;

        this.loading = false;

        this.cdr.detectChanges();

        console.log(
          '3 - Notifications:',
          this.notifications.length
        );

      },

      error: (err) => {

        console.error(
          'Notifications ERROR:',
          err
        );

        this.error =
          'حدث خطأ أثناء تحميل الإشعارات';

        this.loading = false;

        this.cdr.detectChanges();

      }

    });

  }

  markAsRead(notification: Notification): void {

    if (notification.isRead || !notification._id) {
      return;
    }

    console.log(
      'Marking notification as read:',
      notification._id
    );

    this.notificationService
      .updateNotification(notification._id, {
        isRead: true
      })
      .subscribe({

        next: (updatedNotification) => {

          console.log(
            'Notification marked as read:',
            updatedNotification
          );

          const index = this.notifications.findIndex(
            item => item._id === notification._id
          );

          if (index !== -1) {

            this.notifications[index] =
              updatedNotification;

          }

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Mark as read error:',
            err
          );

          this.error =
            'حدث خطأ أثناء تحديث الإشعار';

          this.cdr.detectChanges();

        }

      });
  }


  deleteNotification(notification: Notification): void {

  if (!notification._id) {
    return;
  }

  const confirmed = confirm(
    'هل أنت متأكد من حذف هذا الإشعار؟'
  );

  if (!confirmed) {
    return;
  }

  console.log(
    'Deleting notification:',
    notification._id
  );

  this.notificationService
    .deleteNotification(notification._id)
    .subscribe({

      next: (response) => {

        console.log(
          'Notification deleted:',
          response
        );

        this.notifications =
          this.notifications.filter(
            item => item._id !== notification._id
          );

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error(
          'Delete notification error:',
          err
        );

        this.error =
          'حدث خطأ أثناء حذف الإشعار';

        this.cdr.detectChanges();

      }

    });

}

markAllAsRead(): void {

  const unreadNotifications = this.notifications.filter(
    notification => !notification.isRead && notification._id
  );

  if (unreadNotifications.length === 0) {
    return;
  }

  console.log(
    'Marking all notifications as read:',
    unreadNotifications.length
  );

  unreadNotifications.forEach(notification => {

    this.notificationService
      .updateNotification(notification._id!, {
        isRead: true
      })
      .subscribe({

        next: (updatedNotification) => {

          const index = this.notifications.findIndex(
            item => item._id === updatedNotification._id
          );

          if (index !== -1) {

            this.notifications[index] =
              updatedNotification;

          }

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Mark all as read error:',
            err
          );

          this.error =
            'حدث خطأ أثناء تحديث الإشعارات';

          this.cdr.detectChanges();

        }

      });

  });

}

hasUnreadNotifications(): boolean {
  return this.notifications.some(
    notification => !notification.isRead
  );
}
}