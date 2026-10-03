import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  let setHeaders: Record<string, string> = {};

  if (token) {
    setHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;
      if (userId) {
        setHeaders['x-user-id'] = userId;
      }
    } catch {
      // ignore
    }
  }

  if (Object.keys(setHeaders).length > 0) {
    req = req.clone({ setHeaders });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return throwError(() => error);
    })
  );
};