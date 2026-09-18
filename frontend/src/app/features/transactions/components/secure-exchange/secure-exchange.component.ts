import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-secure-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './secure-exchange.component.html',
  styleUrl: './secure-exchange.component.css'
})
export class SecureExchangeComponent {
  @Input() transaction!: Transaction;
  @Output() statusUpdated = new EventEmitter<Transaction>();

  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  otpInput: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  verifyAndComplete(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const cleanInput = this.otpInput.trim();
    if (!cleanInput) {
      this.errorMessage = 'Please enter the OTP verification code';
      return;
    }

    if (this.transaction.handshakeOTP && cleanInput !== this.transaction.handshakeOTP) {
      this.errorMessage = 'Invalid verification code. Please check and try again.';
      return;
    }

    this.isSubmitting = true;

    // Use updateTransaction API to set status to 'completed'
    this.transactionService.updateTransaction(this.transaction._id, {
      status: 'completed',
      handshakeOTP: cleanInput
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        const updated = res.data || res;
        this.successMessage = 'Exchange verified and completed successfully!';
        this.toastService.success('Transaction completed successfully!');
        this.statusUpdated.emit(updated as Transaction);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Failed to update transaction status';
        this.errorMessage = msg;
        this.toastService.error(msg);
      }
    });
  }
}
