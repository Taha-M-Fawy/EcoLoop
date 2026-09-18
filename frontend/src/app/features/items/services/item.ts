import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemFilters, ApiResponse, CategorySummary } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/api/items';
  private readonly categoriesUrl = 'http://localhost:5000/api/categories';

  // جلب التصنيفات من الباك إند
  getCategories(): Observable<ApiResponse<CategorySummary[]>> {
    return this.http.get<ApiResponse<CategorySummary[]>>(this.categoriesUrl);
  }

  // جلب العناصر مع إرسال جميع الفلاتر (بما فيها categoryId) كـ Query Params للباك إند
  getAllItems(filters: ItemFilters = {}): Observable<ApiResponse<Item[]>> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Item[]>>(this.apiUrl, { params });
  }

  getItemById(id: string): Observable<ApiResponse<Item>> {
    return this.http.get<ApiResponse<Item>>(`${this.apiUrl}/${id}`);
  }

  createItem(itemData: Partial<Item>): Observable<ApiResponse<Item>> {
    return this.http.post<ApiResponse<Item>>(this.apiUrl, itemData);
  }

  updateItem(id: string, itemData: Partial<Item>): Observable<ApiResponse<Item>> {
    return this.http.put<ApiResponse<Item>>(`${this.apiUrl}/${id}`, itemData);
  }

  deleteItem(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`);
  }
}