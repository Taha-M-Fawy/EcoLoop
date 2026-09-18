import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<any>(`${this.apiUrl}/users`);
  }

  getItems() {
    return this.http.get<any>(`${this.apiUrl}/items`);
  }

  getCategories() {
    return this.http.get<any>(`${this.apiUrl}/categories`);
  }

  getReviews() {
    return this.http.get<any>(`${this.apiUrl}/reviews`);
  }

  getNotifications() {
    return this.http.get<any>(`${this.apiUrl}/notifications`);
  }
}