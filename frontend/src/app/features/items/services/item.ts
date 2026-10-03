import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, shareReplay, of, tap } from 'rxjs';
import { Item, ItemFilters, ApiResponse, CategorySummary } from '../models/item.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/items`;
  private readonly categoriesUrl = `${environment.apiUrl}/categories`;
  private categories$?: Observable<ApiResponse<CategorySummary[]>>;
  private itemsCache = new Map<string, { timestamp: number; data: ApiResponse<Item[]> }>();

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let userId = '';

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user?._id || user?.id || '';
      } catch {
        userId = '';
      }
    }

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (userId) {
      headers = headers.set('x-user-id', userId);
    }
    return headers;
  }

  // 1. جلب التصنيفات مع كاش محلي
  getCategories(): Observable<ApiResponse<CategorySummary[]>> {
    if (!this.categories$) {
      this.categories$ = this.http.get<ApiResponse<CategorySummary[]>>(this.categoriesUrl).pipe(
        shareReplay(1)
      );
    }
    return this.categories$;
  }

  // 2. جلب العناصر مع الفلاتر وتمرير الهيدرز مع كاش فوري
  getAllItems(filters: (ItemFilters & { owner?: string; ownerId?: string }) = {}): Observable<ApiResponse<Item[]>> {
    const cacheKey = JSON.stringify(filters);
    const cached = this.itemsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < 60000)) {
      return of(cached.data);
    }

    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Item[]>>(this.apiUrl, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      tap((res) => {
        if (res && res.data) {
          this.itemsCache.set(cacheKey, { timestamp: Date.now(), data: res });
        }
      })
    );
  }

  // 3. جلب تفاصيل سلعة
  getItemById(id: string): Observable<ApiResponse<Item>> {
    return this.http.get<ApiResponse<Item>>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // 4. إضافة سلعة
  createItem(itemData: Partial<Item>): Observable<ApiResponse<Item>> {
    this.itemsCache.clear();
    return this.http.post<ApiResponse<Item>>(this.apiUrl, itemData, {
      headers: this.getAuthHeaders()
    });
  }

  // 5. تعديل سلعة
  updateItem(id: string, itemData: Partial<Item>): Observable<ApiResponse<Item>> {
    this.itemsCache.clear();
    return this.http.put<ApiResponse<Item>>(`${this.apiUrl}/${id}`, itemData, {
      headers: this.getAuthHeaders()
    });
  }

  // 6. حذف سلعة
  deleteItem(id: string): Observable<ApiResponse<null>> {
    this.itemsCache.clear();
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}