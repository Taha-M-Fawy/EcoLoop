import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/services/auth';
import { DashboardService } from './services/dashboard';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {

  usersCount = 0;
  itemsCount = 0;
  categoriesCount = 0;
  reviewsCount = 0;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {

    this.dashboardService.getUsers().subscribe({
      next: (users) => {
        this.usersCount = users.length;
        this.cdr.detectChanges();
        console.log('Users:', this.usersCount);
      },
      error: (err) => {
        console.log('Users Error:', err);
      }
    });

    this.dashboardService.getItems().subscribe({
      next: (items) => {
        this.itemsCount = items.data.length;
        this.cdr.detectChanges();
        console.log('Items:', this.itemsCount);
      },
      error: (err) => {
        console.log('Items Error:', err);
      }
    });

    this.dashboardService.getCategories().subscribe({
      next: (categories) => {
        this.categoriesCount = categories.length;
        this.cdr.detectChanges();
        console.log('Categories:', this.categoriesCount);
      },
      error: (err) => {
        console.log('Categories Error:', err);
      }
    });

    this.dashboardService.getReviews().subscribe({
      next: (reviews) => {
        this.reviewsCount = reviews.length;
        this.cdr.detectChanges();
        console.log('Reviews:', this.reviewsCount);
      },
      error: (err) => {
        console.log('Reviews Error:', err);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}