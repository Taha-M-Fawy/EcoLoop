export interface Request {
  _id?: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  quantity: number;
  governorate: string;
  city: string;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Closed';
}