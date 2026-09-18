import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TransactionService } from '../../services/transaction.service';
import { Transaction, TransactionStatus, ItemSummary, UserSummary } from '../../models/transaction.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-transaction-update',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transaction-update.component.html',
  styleUrl: './transaction-update.component.css'
})
export class TransactionUpdateComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  transaction: Transaction | null = null;
  loading: boolean = true;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  formData = {
    status: 'pending' as TransactionStatus,
    handshakeOTP: ''
  };

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
          if (this.transaction) {
            this.formData.status = this.transaction.status;
            this.formData.handshakeOTP = this.transaction.handshakeOTP || '';
          }
        },
        error: (err) => {
          console.error('Failed to fetch transaction:', err);
          this.errorMessage = err.error?.message || 'Transaction not found';
        }
      });
  }

  getItemTitle(): string {
    if (!this.transaction) return '';
    if (typeof this.transaction.itemId === 'object' && this.transaction.itemId.title) {
      return this.transaction.itemId.title;
    }
    return String(this.transaction.itemId);
  }

  getDonorName(): string {
    if (!this.transaction) return '';
    if (typeof this.transaction.donorOrSellerId === 'object' && this.transaction.donorOrSellerId.name) {
      return this.transaction.donorOrSellerId.name;
    }
    return String(this.transaction.donorOrSellerId);
  }

  getReceiverName(): string {
    if (!this.transaction) return '';
    if (typeof this.transaction.receiverId === 'object' && this.transaction.receiverId.name) {
      return this.transaction.receiverId.name;
    }
    return String(this.transaction.receiverId);
  }

  onSubmit(): void {
    if (!this.transaction) return;
    this.errorMessage = '';
    this.isSubmitting = true;

    const payload: Partial<Transaction> = {
      status: this.formData.status,
      handshakeOTP: this.formData.handshakeOTP.trim()
    };

    this.transactionService.updateTransaction(this.transaction._id, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.toastService.success('Transaction updated successfully');
          this.router.navigate(['/transactions', this.transaction!._id]);
        },
        error: (err) => {
          console.error('Failed to update transaction:', err);
          const msg = err.error?.message || 'Error updating transaction status';
          this.errorMessage = msg;
          this.toastService.error(msg);
        }
      });
  }
}
