// // import { Component } from '@angular/core';

// // @Component({
// //   imports: [],
// //   selector: 'app-review-form',
// //   styleUrl: './review-form.css',
// //   templateUrl: './review-form.html',
// // })
// // export class ReviewForm {}




// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ReviewService } from '../../services/review';

// @Component({
//   selector: 'app-review-form',
//   imports: [FormsModule, CommonModule],
//   templateUrl: './review-form.html',
//   styleUrl: './review-form.css',
// })
// export class ReviewForm {
//   transactionId = '';
//   reviewerId = '';
//   reviewedUserId = '';
//   rating = 5;
//   comment = '';
//   successMessage = '';
//   errorMessage = '';

//   constructor(private reviewService: ReviewService) {}

//   submitReview(): void {
//     this.reviewService
//       .createReview({
//         transactionId: this.transactionId,
//         reviewerId: this.reviewerId,
//         reviewedUserId: this.reviewedUserId,
//         rating: this.rating,
//         comment: this.comment,
//       })
//       .subscribe({
//         next: () => {
//           this.successMessage = 'تم إضافة التقييم بنجاح';
//           this.errorMessage = '';
//           this.transactionId = '';
//           this.reviewerId = '';
//           this.reviewedUserId = '';
//           this.rating = 5;
//           this.comment = '';
//         },
//         error: () => {
//           this.errorMessage = 'حصل خطأ أثناء إضافة التقييم';
//           this.successMessage = '';
//         },
//       });
//   }
// }





// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ReviewService } from '../../services/review';

// @Component({
//   selector: 'app-review-form',
//   standalone: true,
//   imports: [FormsModule, CommonModule],
//   templateUrl: './review-form.html',
//   styleUrl: './review-form.css',
// })
// export class ReviewForm {

//   rating = 5;
//   comment = '';

//   successMessage = '';
//   errorMessage = '';

//   constructor(private reviewService: ReviewService) {}

//   selectRating(value: number): void {
//     this.rating = value;
//   }
// }


import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../services/review';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './review-form.html',
  styleUrl: './review-form.css',
})
export class ReviewForm {

  // Temporary test IDs
  transactionId = '64f1a2b3c4d5e6f7a8b9c0d4';
  reviewerId = '64f1a2b3c4d5e6f7a8b9c0d5';
  reviewedUserId = '64f1a2b3c4d5e6f7a8b9c0d6';

  rating = 5;
  comment = '';

  successMessage = '';
  errorMessage = '';

  constructor(
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}
  selectRating(value: number): void {
    this.rating = value;
  }

submitReview(): void {

  this.successMessage = '';
  this.errorMessage = '';

  const review = {
    transactionId: this.transactionId,
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
      this.errorMessage = '';

      // Reset form for a new review
      this.rating = 5;
      this.comment = '';

      this.cdr.detectChanges();
    },

    error: (err) => {

      console.error('Create review error:', err);

      this.errorMessage =
        err?.error?.message || 'حدث خطأ أثناء إضافة التقييم';

      this.successMessage = '';

    }

  });
}
}