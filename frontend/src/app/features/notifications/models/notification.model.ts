export interface Notification {
  _id?: string;
  userId: string;
  title?: string;
  message: string;
  type: 'review' | 'transaction' | 'request' | 'system' | 'match';
  relatedEntityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}