export interface RequestUser {
  _id?: string;
  id?: string;
  username?: string;
  name?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
}

export interface Request {
  _id?: string;
  userId: string | RequestUser | any;
  categoryId: string | any;
  title: string;
  description: string;
  quantity: number;
  governorate: string;
  city: string;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Closed';
}