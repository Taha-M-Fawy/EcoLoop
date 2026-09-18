export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ItemSummary {
  _id: string;
  title: string;
  description?: string;
  type?: 'donation' | 'exchange' | 'sell';
  price?: number | null;
  condition?: string;
  images?: string[];
  governorate?: string;
  city?: string;
  status?: string;
}

export interface RequestSummary {
  _id: string;
  status?: string;
  note?: string;
}

export interface Transaction {
  _id: string;
  itemId: string | ItemSummary;
  requestId?: string | RequestSummary;
  donorOrSellerId: string | UserSummary;
  receiverId: string | UserSummary;
  handshakeOTP: string;
  status: TransactionStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}
