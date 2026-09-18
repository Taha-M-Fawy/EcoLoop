import { Routes } from '@angular/router';

import { NotificationList } from './components/notification-list/notification-list';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    component: NotificationList
  }
];