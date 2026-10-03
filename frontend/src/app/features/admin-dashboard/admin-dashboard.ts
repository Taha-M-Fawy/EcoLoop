import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
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
export class AdminDashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  usersCount = 0;
  itemsCount = 0;
  categoriesCount = 0;
  reviewsCount = 0;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getUsers().subscribe({
      next: (users: any) => {
        const list = Array.isArray(users) ? users : (users?.data || []);
        this.usersCount = list.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Users Error:', err);
      }
    });

    this.dashboardService.getItems().subscribe({
      next: (items: any) => {
        this.itemsCount = items?.pagination?.total ?? (items?.data?.length || (Array.isArray(items) ? items.length : 0));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Items Error:', err);
      }
    });

    this.dashboardService.getCategories().subscribe({
      next: (categories: any) => {
        const list = Array.isArray(categories) ? categories : (categories?.data || []);
        this.categoriesCount = list.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Categories Error:', err);
      }
    });

    this.dashboardService.getReviews().subscribe({
      next: (reviews: any) => {
        const list = Array.isArray(reviews) ? reviews : (reviews?.data || []);
        this.reviewsCount = list.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Reviews Error:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}