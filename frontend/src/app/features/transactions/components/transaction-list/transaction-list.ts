import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction';
import { Transaction, TransactionStatus } from '../../models/transaction.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css'
})
export class TransactionListComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  loading = true;
  activeTab: 'all' | 'receiver' | 'donor' | 'completed' = 'all';

  // For verifying OTP on delivery
  otpInputs: { [txId: string]: string } = {};
  actionLoading: { [txId: string]: boolean } = {};

  get currentUserId(): string {
    const user = this.authService.currentUserValue;
    return user?._id || user?.id || '';
  }

  ngOnInit(): void {
    if (!this.currentUserId) {
      this.toast.error('يرجى تسجيل الدخول لعرض المعاملات الخاصة بك');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    this.transactionService.getTransactions().subscribe({
      next: (res) => {
        this.transactions = res.data || [];
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.loading = false;
        this.toast.error('فشل في تحميل المعاملات');
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'all' | 'receiver' | 'donor' | 'completed'): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeTab === 'all') {
      this.filteredTransactions = [...this.transactions];
    } else if (this.activeTab === 'receiver') {
      this.filteredTransactions = this.transactions.filter(
        (t) => String(t.receiverId?._id || t.receiverId?.id) === String(this.currentUserId)
      );
    } else if (this.activeTab === 'donor') {
      this.filteredTransactions = this.transactions.filter(
        (t) => String(t.donorOrSellerId?._id || t.donorOrSellerId?.id) === String(this.currentUserId)
      );
    } else if (this.activeTab === 'completed') {
      this.filteredTransactions = this.transactions.filter((t) => t.status === 'completed');
    }
  }

  get isAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'admin';
  }

  isReceiver(transaction: Transaction): boolean {
    const receiverId = transaction.receiverId?._id || transaction.receiverId?.id;
    return String(receiverId) === String(this.currentUserId);
  }

  isDonor(transaction: Transaction): boolean {
    const donorId = transaction.donorOrSellerId?._id || transaction.donorOrSellerId?.id;
    return String(donorId) === String(this.currentUserId);
  }

  getOtherParty(transaction: Transaction): any {
    return this.isDonor(transaction) ? transaction.receiverId : transaction.donorOrSellerId;
  }

  isPhoneMasked(transaction: Transaction): boolean {
    const isSell = transaction.itemId?.type === 'sell' || ((transaction as any).platformFee && (transaction as any).platformFee > 0);
    const isPending = transaction.status === 'pending';
    const isClosed = transaction.status === 'completed' || transaction.status === 'cancelled';

    if (this.isAdmin) return false;
    return isPending || isSell || isClosed;
  }

  getMaskedPhone(phone: string | undefined): string {
    if (!phone) return '010*****00';
    const trimmed = phone.trim();
    if (trimmed.includes('*')) return trimmed;
    if (trimmed.length <= 4) return '010*****00';
    const prefix = trimmed.slice(0, 3);
    const suffix = trimmed.slice(-2);
    return `${prefix}*****${suffix}`;
  }

  getPhoneTooltip(transaction: Transaction): string {
    if (transaction.status === 'pending') {
      return 'رقم الهاتف محمي ومخفي لحين قبول الطلب لضمان الجدية والأمان';
    }
    if (transaction.itemId?.type === 'sell' || ((transaction as any).platformFee && (transaction as any).platformFee > 0)) {
      return 'محمي بنظام حماية المعاملات (Escrow) لمنع تجاوز المنصة وتأمين المقابلة والاستلام بكود الـ OTP';
    }
    return 'رقم الهاتف محمي لحفظ الخصوصية';
  }

  approveTransaction(transaction: Transaction): void {
    this.actionLoading[transaction._id] = true;
    this.transactionService.updateStatus(transaction._id, 'approved').subscribe({
      next: (res) => {
        this.actionLoading[transaction._id] = false;
        this.toast.success('تمت الموافقة على الطلب بنجاح! تم إرسال كود الاستلام للمستلم.');
        this.updateLocalTransaction(res.data);
      },
      error: (err) => {
        this.actionLoading[transaction._id] = false;
        this.toast.error(err?.error?.message || 'فشل قبول المعاملة');
      }
    });
  }

  cancelTransaction(transaction: Transaction): void {
    if (!confirm('هل أنت متأكد من رغبتك في إلغاء هذه المعاملة؟')) {
      return;
    }

    this.actionLoading[transaction._id] = true;
    this.transactionService.updateStatus(transaction._id, 'cancelled').subscribe({
      next: (res) => {
        this.actionLoading[transaction._id] = false;
        this.toast.success('تم إلغاء المعاملة');
        this.updateLocalTransaction(res.data);
      },
      error: (err) => {
        this.actionLoading[transaction._id] = false;
        this.toast.error(err?.error?.message || 'فشل إلغاء المعاملة');
      }
    });
  }

  completeTransaction(transaction: Transaction): void {
    const otp = this.otpInputs[transaction._id]?.trim();
    if (!otp || otp.length < 6) {
      this.toast.error('يرجى إدخال كود الاستلام المكون من 6 أرقام كاملاً');
      return;
    }

    this.actionLoading[transaction._id] = true;
    this.transactionService.updateStatus(transaction._id, 'completed', otp).subscribe({
      next: (res) => {
        this.actionLoading[transaction._id] = false;
        this.toast.success('مبروك! اكتملت المعاملة بنجاح، يمكنك الآن تقييم الطرف الآخر.');
        this.updateLocalTransaction(res.data);
      },
      error: (err) => {
        this.actionLoading[transaction._id] = false;
        this.toast.error(err?.error?.message || 'كود الاستلام غير صحيح أو فشل تأكيد العملية');
      }
    });
  }

  rateOtherParty(transaction: Transaction): void {
    const otherParty = this.getOtherParty(transaction);
    const otherId = otherParty?._id || otherParty?.id;
    const otherName = otherParty?.name || otherParty?.username || '';

    this.router.navigate(['/reviews/add'], {
      queryParams: {
        transactionId: transaction._id,
        userId: otherId,
        name: otherName
      }
    });
  }

  getStatusBadgeClass(status: TransactionStatus): string {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'approved': return 'badge-approved';
      case 'completed': return 'badge-completed';
      case 'cancelled': return 'badge-cancelled';
      default: return '';
    }
  }

  getStatusLabel(status: TransactionStatus): string {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'approved': return 'تمت الموافقة / قيد التسليم';
      case 'completed': return 'مكتملة بنجاح';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  }

  private updateLocalTransaction(updated: Transaction): void {
    const idx = this.transactions.findIndex((t) => t._id === updated._id);
    if (idx !== -1) {
      this.transactions[idx] = { ...this.transactions[idx], ...updated };
      this.applyFilter();
      this.cdr.detectChanges();
    }
  }
}
