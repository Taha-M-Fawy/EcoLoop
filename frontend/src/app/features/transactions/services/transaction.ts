import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, TransactionResponse } from '../models/transaction.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  getTransactions(filter?: { as?: 'donor' | 'receiver'; status?: string; all?: boolean }): Observable<TransactionResponse<Transaction[]>> {
    let params = new HttpParams();
    if (filter?.as) params = params.set('as', filter.as);
    if (filter?.status && filter.status !== 'all') params = params.set('status', filter.status);
    if (filter?.all) params = params.set('all', 'true');

    return this.http.get<TransactionResponse<Transaction[]>>(this.apiUrl, { params });
  }

  getTransactionById(id: string): Observable<TransactionResponse<Transaction>> {
    return this.http.get<TransactionResponse<Transaction>>(`${this.apiUrl}/${id}`);
  }

  createTransaction(data: {
    itemId?: string;
    requestId?: string;
    donorOrSellerId?: string;
    receiverId?: string;
    notes?: string;
  }): Observable<TransactionResponse<Transaction>> {
    return this.http.post<TransactionResponse<Transaction>>(this.apiUrl, data);
  }

  updateStatus(
    id: string,
    status: 'approved' | 'completed' | 'cancelled',
    otp?: string,
    notes?: string
  ): Observable<TransactionResponse<Transaction>> {
    return this.http.patch<TransactionResponse<Transaction>>(`${this.apiUrl}/${id}/status`, {
      status,
      otp,
      notes
    });
  }

  deleteTransaction(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
