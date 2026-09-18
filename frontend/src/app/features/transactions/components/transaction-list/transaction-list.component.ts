import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TransactionService } from '../../services/transaction.service';
import { Transaction, TransactionStatus, ItemSummary, UserSummary } from '../../models/transaction.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  statusFilter: TransactionStatus | 'all' = 'all';
  searchQuery: string = '';

  // Delete modal state
  deletingTransactionId: string | null = null;
  isDeleting: boolean = false;

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.errorMessage = '';

    this.transactionService.getTransactions()
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
          this.transactions = Array.isArray(data) ? data : [];
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to fetch transactions:', err);
          this.errorMessage = err.error?.message || 'Unable to connect to server to fetch transactions';
          this.transactions = [];
          this.filteredTransactions = [];
        }
      });
  }

  applyFilters(): void {
    let result = [...this.transactions];

    if (this.statusFilter !== 'all') {
      result = result.filter(t => t.status === this.statusFilter);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.trim().toLowerCase();
      result = result.filter(t => {
        const itemTitle = this.getItemTitle(t.itemId).toLowerCase();
        const donorName = this.getUserName(t.donorOrSellerId).toLowerCase();
        const receiverName = this.getUserName(t.receiverId).toLowerCase();
        return itemTitle.includes(query) || donorName.includes(query) || receiverName.includes(query) || t._id.toLowerCase().includes(query);
      });
    }

    this.filteredTransactions = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getItemTitle(itemId: string | ItemSummary): string {
    if (!itemId) return 'Not specified';
    if (typeof itemId === 'object' && itemId.title) {
      return itemId.title;
    }
    return `Item #${String(itemId).substring(0, 6)}`;
  }

  getItemImage(itemId: string | ItemSummary): string | null {
    if (typeof itemId === 'object' && itemId.images && itemId.images.length > 0) {
      return itemId.images[0];
    }
    return null;
  }

  getUserName(user: string | UserSummary): string {
    if (!user) return 'Unknown User';
    if (typeof user === 'object' && user.name) {
      return user.name;
    }
    return `User #${String(user).substring(0, 6)}`;
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

  confirmDelete(id: string): void {
    this.deletingTransactionId = id;
  }

  cancelDelete(): void {
    this.deletingTransactionId = null;
  }

  executeDelete(): void {
    if (!this.deletingTransactionId) return;

    this.isDeleting = true;
    const id = this.deletingTransactionId;

    this.transactionService.deleteTransaction(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting = false;
          this.deletingTransactionId = null;
          this.toastService.success('Transaction deleted successfully');
          this.transactions = this.transactions.filter(t => t._id !== id);
          this.applyFilters();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isDeleting = false;
          this.deletingTransactionId = null;
          const msg = err.error?.message || 'Failed to delete transaction';
          this.toastService.error(msg);
          this.cdr.detectChanges();
        }
      });
  }
}
