import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  email: string;
  role?: string;
  [key: string]: any;
}

export interface AuthResponse {
  token?: string;
  data?: {
    token?: string;
    user?: User;
  };
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api/users';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  // 1. تسجيل الدخول
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => {
        const token = res.token || res.data?.token;
        const user = res.user || res.data?.user;

        if (token) {
          localStorage.setItem('token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  // 2. إنشاء حساب جديد
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData).pipe(
      tap((res) => {
        const token = res.token || res.data?.token;
        const user = res.user || res.data?.user;

        if (token) {
          localStorage.setItem('token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  // 3. جلب بيانات مستخدم بالـ ID
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // 4. تسجيل الخروج
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  // استرجاع الـ Token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // جلب المستخدم الحالي مع Fallback فوري للـ localStorage لو الـ Subject لم يتحدث
  get currentUserValue(): User | null {
    const current = this.currentUserSubject.value;
    if (current) return current;

    const stored = this.getStoredUser();
    if (stored) {
      this.currentUserSubject.next(stored);
      return stored;
    }
    return null;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}