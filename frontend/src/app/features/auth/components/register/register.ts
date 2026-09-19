import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  username = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get emailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  get phoneValid(): boolean {
    return /^01[0125][0-9]{8}$/.test(this.phone);
  }

  onRegister() {
    this.submitted = true;

    if (!this.username.trim()) {
      return;
    }

    if (!this.email.trim() || !this.emailValid) {
      return;
    }

    if (!this.phone.trim() || !this.phoneValid) {
      return;
    }

    if (this.password.length < 6) {
      return;
    }

    if (!this.confirmPassword || this.password !== this.confirmPassword) {
      return;
    }

    this.authService.register({
      username: this.username.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.authService.saveSession(res.token, res);
        alert('تم إنشاء الحساب بنجاح');
        this.router.navigate(['/items']);
      },
      error: (err: any) => {
        alert(err.error?.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
    });
  }
}