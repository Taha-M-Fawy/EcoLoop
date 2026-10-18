export type TransactionStatus = 'pending' | 'approved' | 'completed' | 'cancelled';

export type PaymentMethod = 'vodafone_cash' | 'orange_cash' | 'etisalat_cash' | 'we_pay' | 'instapay' | 'cash_wallet' | 'none';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded';

export type EscrowStatus = 'none' | 'holding' | 'released' | 'refunded';

export interface PaymentDetails {
  senderWalletNumber?: string;
  receiverWalletNumber?: string;
  transactionRef?: string;
  provider?: string;
  paidAmount?: number;
}

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
  sellerEarnings?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paidAt?: string;
  paymentDetails?: PaymentDetails;
  escrowStatus?: EscrowStatus;
  escrowReleasedAt?: string;
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

export interface FinancialStats {
  totalCommissionsEarned: number;
  totalSalesVolume: number;
  totalGrossAmount: number;
  holdingEscrowAmount: number;
  completedPaidCount: number;
  holdingEscrowCount: number;
  recentTransactions: any[];
}
