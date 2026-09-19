


import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
export class ReviewForm {

  // Temporary test IDs
reviewerId = '';
reviewedUserId = '6aad84a6148170904d53c603';

  rating = 5;
  comment = '';

  successMessage = '';
  errorMessage = '';

constructor(
  private reviewService: ReviewService,
  private cdr: ChangeDetectorRef,
  private authService: AuthService,
  private notificationService: NotificationService
) {}

  selectRating(value: number): void {
    this.rating = value;
  }

submitReview(): void {

  this.successMessage = '';
  this.errorMessage = '';

const review = {
  reviewerId: this.reviewerId,
  reviewedUserId: this.reviewedUserId,
  rating: this.rating,
  comment: this.comment
};

  console.log('Sending review:', review);

this.reviewService.createReview(review).subscribe({
  next: (response) => {

    console.log('Review created:', response);

    this.successMessage = 'Review added successfully';

    this.rating = 5;
    this.comment = '';

    this.notificationService.refreshUnreadCount();

    this.cdr.detectChanges();
  },

  error: (err) => {

    console.error('Create review error:', err);

    this.errorMessage =
      err?.error?.message || 'حدث خطأ أثناء إضافة التقييم';

  }
});
}

ngOnInit(): void {
  const user = this.authService.getUser();

  console.log('Logged in user:', user);

  if (user?._id) {
    this.reviewerId = user._id;
  }
}
}