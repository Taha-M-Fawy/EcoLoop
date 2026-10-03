import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email: string;
  role?: string;
  phone?: string;
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
  private readonly baseUrl = `${environment.apiUrl}/users`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  // 1. تسجيل الدخول
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res: any) => {
        const token = res.token || res.data?.token;
        const user = res.user || res.data?.user || res;

        this.saveSession(token, user);
      })
    );
  }

  // 2. إنشاء حساب جديد
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData).pipe(
      tap((res: any) => {
        const token = res.token || res.data?.token;
        const user = res.user || res.data?.user || res;

        this.saveSession(token, user);
      })
    );
  }

  // 3. جلب بيانات مستخدم بالـ ID
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // 4. حفظ الجلسة وتحديث الـ Subject فورياً
  saveSession(token: string, user: any): void {
    if (token) {
      localStorage.setItem('token', token);
    }
    if (user) {
      const normalizedUser: User = {
        _id: user._id || user.id,
        id: user._id || user.id,
        username: user.username || user.name,
        name: user.name || user.username,
        email: user.email,
        role: user.role || 'user',
        ...user
      };
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      this.currentUserSubject.next(normalizedUser);
    }
  }

  // استرجاع المستخدم الحالي
  getUser(): User | null {
    return this.currentUserValue;
  }

  // استرجاع الدور
  getRole(): string | null {
    const user = this.currentUserValue;
    return user?.role || null;
  }

  // فحص هل هو آدمن
  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  // فحص تسجيل الدخول
  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  // تسجيل الخروج
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  // استرجاع الـ Token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // جلب المستخدم الحالي مع Fallback فوري للـ localStorage
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