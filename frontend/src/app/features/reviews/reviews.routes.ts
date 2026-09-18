// import { Routes } from '@angular/router';

// export const REVIEWS_ROUTES: Routes = [];




import { Routes } from '@angular/router';
import { ReviewList } from './components/review-list/review-list';
import { ReviewForm } from './components/review-form/review-form';

export const REVIEWS_ROUTES: Routes = [
  { path: '', component: ReviewList },
  { path: 'add', component: ReviewForm },
];