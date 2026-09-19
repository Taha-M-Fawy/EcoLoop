export interface Notification {
  _id?: string;
  userId: string;
  message: string;
  type: 'review' | 'transaction' | 'request' | 'system';
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}