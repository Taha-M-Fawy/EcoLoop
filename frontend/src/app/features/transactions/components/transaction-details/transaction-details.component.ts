import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TransactionService } from '../../services/transaction.service';
import { Transaction, TransactionStatus, ItemSummary, UserSummary, RequestSummary } from '../../models/transaction.model';
import { SecureExchangeComponent } from '../secure-exchange/secure-exchange.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule, RouterLink, SecureExchangeComponent],
  templateUrl: './transaction-details.component.html',
  styleUrl: './transaction-details.component.css'
})
export class TransactionDetailsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  transaction: Transaction | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  // Delete modal state
  showDeleteModal: boolean = false;
  isDeleting: boolean = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTransaction(id);
    } else {
      this.errorMessage = 'Invalid transaction ID';
      this.loading = false;
    }
  }

  loadTransaction(id: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.transactionService.getTransactionById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.data || res;
          this.transaction = data;
        },
        error: (err) => {
          console.error('Failed to fetch transaction details:', err);
          this.errorMessage = err.error?.message || 'Transaction details not found';
        }
      });
  }

  getItemObject(): ItemSummary | null {
    if (this.transaction && typeof this.transaction.itemId === 'object') {
      return this.transaction.itemId as ItemSummary;
    }
    return null;
  }

  getDonorObject(): UserSummary | null {
    if (this.transaction && typeof this.transaction.donorOrSellerId === 'object') {
      return this.transaction.donorOrSellerId as UserSummary;
    }
    return null;
  }

  getReceiverObject(): UserSummary | null {
    if (this.transaction && typeof this.transaction.receiverId === 'object') {
      return this.transaction.receiverId as UserSummary;
    }
    return null;
  }

  getRequestObject(): RequestSummary | null {
    if (this.transaction && typeof this.transaction.requestId === 'object') {
      return this.transaction.requestId as RequestSummary;
    }
    return null;
  }

  getStatusBadgeClass(status: TransactionStatus): string {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  }

  getStatusLabel(status: TransactionStatus): string {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
      default:
        return 'Pending';
    }
  }

  onStatusUpdated(updated: Transaction): void {
    this.transaction = updated;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  executeDelete(): void {
    if (!this.transaction) return;

    this.isDeleting = true;
    const id = this.transaction._id;

    this.transactionService.deleteTransaction(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting = false;
          this.toastService.success('Transaction deleted successfully');
          this.router.navigate(['/transactions']);
        },
        error: (err) => {
          this.isDeleting = false;
          this.showDeleteModal = false;
          const msg = err.error?.message || 'Failed to delete transaction';
          this.toastService.error(msg);
          this.cdr.detectChanges();
        }
      });
  }
}
