// import { Service } from '@angular/core';

// @Service()
// export class Review {}



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = 'http://localhost:5000/api/reviews';

  constructor(private http: HttpClient) {}

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.baseUrl);
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  createReview(review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, review);
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/${id}`, review);
  }

  deleteReview(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}