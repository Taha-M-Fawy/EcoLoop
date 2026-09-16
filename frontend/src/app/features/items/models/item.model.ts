export type ItemType = 'donation' | 'exchange' | 'sell';
export type ItemCondition = 'new' | 'like_new' | 'used_good' | 'used_fair';
export type ItemStatus = 'available' | 'reserved' | 'completed';

export interface UserSummary {
  _id: string;
  name: string;
  phone?: string;
  impactScore?: number;
  ratingAverage?: number;
}

export interface CategorySummary {
  _id: string;
  name: string;
  icon?: string;
}

export interface Item {
  _id: string;
  title: string;
  description: string;
  type: ItemType;
  price: number | null;
  exchangeWith: string | null;
  condition: ItemCondition;
  quantity: number;
  images: string[];
  governorate: string;
  city: string;
  status: ItemStatus;
  isVerified: boolean;
  ownerId: string | UserSummary;
  categoryId: string | CategorySummary;
  createdAt: string;
  updatedAt: string;
}

export interface ItemFilters {
  type?: ItemType | 'all';
  categoryId?: string;
  governorate?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
  data: T;
}