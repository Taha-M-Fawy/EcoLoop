import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../../services/review';
import { AuthService } from '../../../auth/services/auth';
import { NotificationService } from '../../../notifications/services/notification';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './review-form.html',
  styleUrl: './review-form.css',
})
export class ReviewForm implements OnInit {
  private reviewService = inject(ReviewService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  transactionId = '';
  reviewerId = '';
  reviewedUserId = '';
  reviewedUserName = '';

  rating = 5;
  comment = '';

  successMessage = '';
  errorMessage = '';
  submitting = false;

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user?._id || user?.id) {
      this.reviewerId = user._id || user.id || '';
    }

    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['transactionId']) {
      this.transactionId = queryParams['transactionId'];
    }
    if (queryParams['userId'] || queryParams['reviewedUserId']) {
      this.reviewedUserId = queryParams['userId'] || queryParams['reviewedUserId'] || '';
    }
    if (queryParams['name'] || queryParams['userName']) {
      this.reviewedUserName = queryParams['name'] || queryParams['userName'] || '';
    }
  }

  selectRating(value: number): void {
    this.rating = value;
  }

  submitReview(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.reviewerId) {
      const user = this.authService.getUser();
      this.reviewerId = user?._id || user?.id || '';
    }

    if (!this.reviewerId) {
      this.errorMessage = 'يجب تسجيل الدخول أولاً لإرسال تقييم';
      return;
    }

    if (!this.reviewedUserId) {
      this.errorMessage = 'يرجى تحديد أو إدخال معرّف المستخدم المراد تقييمه';
      return;
    }

    if (this.reviewedUserId === this.reviewerId) {
      this.errorMessage = 'لا يمكنك تقييم نفسك';
      return;
    }

    this.submitting = true;

    const review: any = {
      transactionId: this.transactionId || undefined,
      reviewerId: this.reviewerId,
      reviewedUserId: this.reviewedUserId,
      rating: this.rating,
      comment: this.comment.trim()
    };

    this.reviewService.createReview(review).subscribe({
      next: (response) => {
        this.submitting = false;
        this.successMessage = 'تم إرسال التقييم بنجاح، شكرًا لمشاركتك!';
        this.rating = 5;
        this.comment = '';
        this.notificationService.refreshUnreadCount();
        this.cdr.detectChanges();

        setTimeout(() => {
          if (this.transactionId) {
            this.router.navigate(['/transactions']);
          } else {
            this.router.navigate(['/reviews']);
          }
        }, 1500);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Create review error:', err);
        this.errorMessage =
          err?.error?.message || 'حدث خطأ أثناء إضافة التقييم';
        this.cdr.detectChanges();
      }
    });
  }
}