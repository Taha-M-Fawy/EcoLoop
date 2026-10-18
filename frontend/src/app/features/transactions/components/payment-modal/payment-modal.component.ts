import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PaymentMethod, Transaction } from '../../models/transaction.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css'
})
export class PaymentModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() itemTitle = '';
  @Input() itemPrice = 0;
  @Input() itemImage = '';
  @Input() sellerName = '';
  @Input() transactionId?: string;

  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<{
    paymentMethod: PaymentMethod;
    paymentDetails: any;
    transaction?: Transaction;
  }>();

  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  selectedProvider: PaymentMethod = 'etisalat_cash';
  senderWalletNumber = '';
  transactionRef = '';
  submitting = false;
  copied = false;
  step: 'pay' | 'success' = 'pay';
  lastProcessedTx?: Transaction;

  officialWallets: Record<PaymentMethod, { number: string; label: string; iconBg: string }> = {
    etisalat_cash: { number: (environment as any).platformWallets?.etisalatCash || '01159511474', label: 'اتصالات كاش الرسمية', iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    vodafone_cash: { number: (environment as any).platformWallets?.vodafoneCash || '01159511474', label: 'التحويل من فودافون كاش لمحفظتنا', iconBg: 'bg-rose-50 text-rose-700 border-rose-200' },
    instapay: { number: (environment as any).platformWallets?.instaPay || '01159511474', label: 'التحويل من إنستاباي لمحفظتنا', iconBg: 'bg-purple-50 text-purple-700 border-purple-200' },
    orange_cash: { number: (environment as any).platformWallets?.orangeCash || '01159511474', label: 'التحويل من أورانج كاش لمحفظتنا', iconBg: 'bg-orange-50 text-orange-700 border-orange-200' },
    we_pay: { number: (environment as any).platformWallets?.wePay || '01159511474', label: 'التحويل من وي باي لمحفظتنا', iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    cash_wallet: { number: (environment as any).platformWallets?.etisalatCash || '01159511474', label: 'محفظة كاش إلكترونية', iconBg: 'bg-slate-50 text-slate-700 border-slate-200' },
    none: { number: (environment as any).platformWallets?.etisalatCash || '01159511474', label: 'محفظة المنصة', iconBg: 'bg-slate-50 text-slate-700 border-slate-200' }
  };

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.phone) {
      this.senderWalletNumber = user.phone;
    }
    this.generateMockRef();
  }

  get platformFee(): number {
    return Math.max(10, Math.round((this.itemPrice || 0) * 0.05));
  }

  get totalAmount(): number {
    return (this.itemPrice || 0) + this.platformFee;
  }

  get currentOfficialWallet(): { number: string; label: string; iconBg: string } {
    return this.officialWallets[this.selectedProvider] || this.officialWallets.vodafone_cash;
  }

  generateMockRef(): void {
    const prefix = this.selectedProvider === 'instapay' ? 'IPA' : 'VF';
    this.transactionRef = `${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`;
  }

  selectProvider(provider: PaymentMethod): void {
    this.selectedProvider = provider;
    this.generateMockRef();
  }

  copyWalletNumber(): void {
    const num = this.currentOfficialWallet.number;
    navigator.clipboard?.writeText(num);
    this.copied = true;
    this.toast.success(`تم نسخ ${this.currentOfficialWallet.label}: ${num}`);
    setTimeout(() => {
      this.copied = false;
    }, 2500);
  }

  fillQuickDemo(): void {
    if (!this.senderWalletNumber) {
      this.senderWalletNumber = '01098765432';
    }
    this.generateMockRef();
    this.toast.info('تم تجهيز بيانات المحفظة ورقم التحويل التجريبي بنجاح!');
  }

  onCloseModal(): void {
    if (this.submitting) return;
    this.step = 'pay';
    this.close.emit();
  }

  submitPayment(): void {
    if (!this.senderWalletNumber || this.senderWalletNumber.trim().length < 9) {
      this.toast.error('يرجى كتابة رقم المحفظة / الهاتف المحوّل منه');
      return;
    }

    this.submitting = true;

    const paymentDetails = {
      senderWalletNumber: this.senderWalletNumber.trim(),
      receiverWalletNumber: this.currentOfficialWallet.number,
      transactionRef: this.transactionRef.trim() || `TX-${Date.now()}`,
      provider: this.selectedProvider,
      paidAmount: this.totalAmount
    };

    if (this.transactionId) {
      // Paying an existing transaction
      this.transactionService.payTransaction(this.transactionId, {
        paymentMethod: this.selectedProvider,
        paymentDetails
      }).subscribe({
        next: (res) => {
          this.submitting = false;
          this.lastProcessedTx = res.data;
          this.step = 'success';
          this.toast.success('تم تأكيد الدفع بنجاح عبر كاش وحفظ المبلغ في الضمان!');
          this.paymentSuccess.emit({
            paymentMethod: this.selectedProvider,
            paymentDetails,
            transaction: res.data
          });
        },
        error: (err) => {
          this.submitting = false;
          console.error('Pay transaction error:', err);
          this.toast.error(err?.error?.message || 'فشل في سداد المعاملة');
        }
      });
    } else {
      // Triggered from item details before transaction creation
      setTimeout(() => {
        this.submitting = false;
        this.step = 'success';
        this.paymentSuccess.emit({
          paymentMethod: this.selectedProvider,
          paymentDetails
        });
      }, 600);
    }
  }
}
