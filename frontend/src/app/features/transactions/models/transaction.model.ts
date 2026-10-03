export type TransactionStatus = 'pending' | 'approved' | 'completed' | 'cancelled';

export interface UserSummary {
  _id: string;
  id?: string;
  username: string;
  name?: string;
  email: string;
  phone?: string;
  profileImage?: string;
  ratingAverage?: number;
}

export interface ItemSummary {
  _id: string;
  title: string;
  images?: string[];
  price?: number;
  type?: 'donation' | 'exchange' | 'sell';
  condition?: string;
  status?: string;
  governorate?: string;
  city?: string;
}

export interface RequestSummary {
  _id: string;
  title: string;
  quantity?: number;
  urgency?: 'Low' | 'Medium' | 'High';
  status?: 'Open' | 'Closed';
  governorate?: string;
  city?: string;
}

export interface Transaction {
  _id: string;
  itemId?: ItemSummary | null;
  requestId?: RequestSummary | null;
  donorOrSellerId: UserSummary;
  receiverId: UserSummary;
  handshakeOTP: string;
  status: TransactionStatus;
  itemPrice?: number;
  platformFee?: number;
  totalAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}
