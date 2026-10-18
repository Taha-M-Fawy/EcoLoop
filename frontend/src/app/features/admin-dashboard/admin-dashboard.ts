import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/services/auth';
import { DashboardService } from './services/dashboard';
import { TransactionService } from '../transactions/services/transaction';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private transactionService = inject(TransactionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  usersCount = 0;
  itemsCount = 0;
  categoriesCount = 0;
  reviewsCount = 0;

  totalCommissions = 0;
  totalSalesVolume = 0;
  holdingEscrow = 0;
  completedSalesCount = 0;

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

    this.transactionService.getFinancialStats().subscribe({
      next: (res) => {
        if (res?.data) {
          this.totalCommissions = res.data.totalCommissionsEarned || 0;
          this.totalSalesVolume = res.data.totalSalesVolume || 0;
          this.holdingEscrow = res.data.holdingEscrowAmount || 0;
          this.completedSalesCount = res.data.completedPaidCount || 0;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Financial stats error:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}