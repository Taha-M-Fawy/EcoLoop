export interface Review {
  _id?: string;
  transactionId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}