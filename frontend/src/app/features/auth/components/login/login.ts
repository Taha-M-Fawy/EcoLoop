import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {

    if (!this.email.trim()) {
      alert('من فضلك أدخل البريد الإلكتروني');
      return;
    }

    if (!this.password) {
      alert('من فضلك أدخل كلمة المرور');
      return;
    }

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (res: any) => {

        this.authService.saveSession(res.token, res);

        if (res.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/items']);
        }
      },
      error: (err: any) => {
        alert(err.error?.message || 'بيانات الدخول غير صحيحة');
      }
    });
  }
}