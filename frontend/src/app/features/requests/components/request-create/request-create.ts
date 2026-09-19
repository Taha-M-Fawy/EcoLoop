import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { RequestService } from '../../services/request';
import { AuthService } from '../../../../core/services/auth.service';

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-request-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-create.html',
  styleUrl: './request-create.css'
})
export class RequestCreate implements OnInit {
  private requestService = inject(RequestService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  categories: Category[] = [];

  form = {
    categoryId: '',
    title: '',
    description: '',
    quantity: 1,
    governorate: '',
    city: '',
    urgency: 'Medium' as 'Low' | 'Medium' | 'High'
  };

  loadingCategories = false;
  submitting = false;
  error = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.error = '';

    this.http.get<Category[]>('http://localhost:5000/api/categories')
      .subscribe({
        next: (categories) => {
          this.categories = categories.filter(category => category.isActive !== false);
          this.loadingCategories = false;
        },
        error: (err) => {
          console.error('Categories API Error:', err);
          this.error = 'حدث خطأ أثناء تحميل التصنيفات';
          this.loadingCategories = false;
        }
      });
  }

  submitRequest(): void {
    this.error = '';

    const userId = this.authService.currentUserValue?._id;

    if (!userId) {
      this.error = 'يجب تسجيل الدخول أولًا';
      return;
    }

    if (!this.form.categoryId) {
      this.error = 'من فضلك اختاري التصنيف';
      return;
    }

    if (!this.form.title.trim()) {
      this.error = 'من فضلك اكتبي عنوان الطلب';
      return;
    }

    if (!this.form.description.trim()) {
      this.error = 'من فضلك اكتبي وصف الطلب';
      return;
    }

    if (this.form.quantity < 1) {
      this.error = 'الكمية يجب أن تكون 1 على الأقل';
      return;
    }

    if (!this.form.governorate.trim() || !this.form.city.trim()) {
      this.error = 'من فضلك اكتبي المحافظة والمدينة';
      return;
    }

    const newRequest = {
      userId,
      categoryId: this.form.categoryId,
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      quantity: Number(this.form.quantity),
      governorate: this.form.governorate.trim(),
      city: this.form.city.trim(),
      urgency: this.form.urgency,
      status: 'Open' as const
    };

    this.submitting = true;

    this.requestService.createRequest(newRequest).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/requests']);
      },
      error: (err) => {
        console.error('Create Request Error:', err);
        this.error = 'حدث خطأ أثناء إنشاء الطلب';
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/requests']);
  }
}