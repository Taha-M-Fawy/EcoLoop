// // import { Component } from '@angular/core';

// // @Component({
// //   imports: [],
// //   selector: 'app-review-list',
// //   styleUrl: './review-list.css',
// //   templateUrl: './review-list.html',
// // })
// // export class ReviewList {}



// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Review } from '../../models/review.model';
// import { ReviewService } from '../../services/review';

// @Component({
//   selector: 'app-review-list',
//   imports: [CommonModule],
//   templateUrl: './review-list.html',
//   styleUrl: './review-list.css',
// })
// export class ReviewList implements OnInit {
//   reviews: Review[] = [];
//   loading = true;
//   errorMessage = '';

//   constructor(private reviewService: ReviewService) {}

//   ngOnInit(): void {
//     this.reviewService.getReviews().subscribe({
//       next: (data) => {
//         this.reviews = data;
//         this.loading = false;
//       },
//       error: (err) => {
//         this.errorMessage = 'حصل خطأ أثناء تحميل التقييمات';
//         this.loading = false;
//       },
//     });
//   }

//   deleteReview(id: string): void {
//     this.reviewService.deleteReview(id).subscribe({
//       next: () => {
//         this.reviews = this.reviews.filter((r) => r._id !== id);
//       },
//       error: () => {
//         this.errorMessage = 'حصل خطأ أثناء حذف التقييم';
//       },
//     });
//   }
// }



// import { Component, OnInit } from '@angular/core';
// import { ReviewService } from '../../services/review';
// import { Review } from '../../models/review.model';
// import { DatePipe } from '@angular/common';

// @Component({
//   selector: 'app-review-list',
//   standalone: true,
//   imports: [DatePipe],
//   templateUrl: './review-list.html',
//   styleUrl: './review-list.css',
// })
// export class ReviewList implements OnInit {

//   reviews: Review[] = [];
//   loading = false;
//   error = '';

//   constructor(private reviewService: ReviewService) {}

//   ngOnInit(): void {
//     this.loadReviews();
//   }

//   loadReviews(): void {
//     this.loading = true;
//     this.error = '';

//     this.reviewService.getReviews().subscribe({
//       next: (data) => {
//         this.reviews = data;
//         this.loading = false;
//       },

//       error: (err) => {
//         console.error(err);
//         this.error = 'حدث خطأ أثناء تحميل التقييمات';
//         this.loading = false;
//       },
//     });
//   }
// }


import { RouterLink } from '@angular/router';
import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Review } from '../../models/review.model';
import { ReviewService } from '../../services/review';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css'
})


export class ReviewList implements OnInit {

  reviews: Review[] = [];
  loading = true;
  error = '';

  editingReviewId: string | null = null;
  editRating = 5;
  editComment = '';

  constructor(
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    console.log('========== ReviewList Started ==========');

    this.loadReviews();
  }

  loadReviews(): void {

    console.log('1 - Calling API...');

    this.reviewService.getReviews().subscribe({

    next: (data) => {

      console.log('2 - API RESPONSE:', data);

      this.reviews = data;
      this.loading = false;

      this.cdr.detectChanges();

      console.log('3 - Loading:', this.loading);
      console.log('4 - Reviews:', this.reviews.length);

    },

    

      error: (err) => {

        console.error('ERROR:', err);

        this.error = 'حدث خطأ أثناء تحميل التقييمات';
        this.loading = false;
         this.cdr.detectChanges();

      }

    });
  }


deleteReview(id: string): void {

  const confirmed = confirm('هل أنت متأكد من حذف هذا التقييم؟');

  if (!confirmed) {
    return;
  }

  this.reviewService.deleteReview(id).subscribe({

    next: (response) => {

      console.log('Review deleted:', response);

      this.reviews = this.reviews.filter(
        review => review._id !== id
      );

      this.cdr.detectChanges();

    },

    error: (err) => {

      console.error('Delete review error:', err);

      this.error = 'حدث خطأ أثناء حذف التقييم';

      this.cdr.detectChanges();

    }

  });
}

startEdit(review: Review): void {

  this.editingReviewId = review._id ?? null;
  this.editRating = review.rating;
  this.editComment = review.comment ?? '';

  this.cdr.detectChanges();
}

cancelEdit(): void {

  this.editingReviewId = null;
  this.editRating = 5;
  this.editComment = '';

  this.cdr.detectChanges();
}


updateReview(): void {

  if (!this.editingReviewId) {
    return;
  }

  const updatedReview = {
    rating: this.editRating,
    comment: this.editComment
  };

  console.log('Updating review:', updatedReview);

  this.reviewService
    .updateReview(this.editingReviewId, updatedReview)
    .subscribe({

      next: (response) => {

        console.log('Review updated:', response);

        const index = this.reviews.findIndex(
          review => review._id === this.editingReviewId
        );

        if (index !== -1) {
          this.reviews[index] = response;
        }

        this.editingReviewId = null;
        this.editRating = 5;
        this.editComment = '';

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('Update review error:', err);

        this.error = 'حدث خطأ أثناء تعديل التقييم';

        this.cdr.detectChanges();

      }

    });
}

}