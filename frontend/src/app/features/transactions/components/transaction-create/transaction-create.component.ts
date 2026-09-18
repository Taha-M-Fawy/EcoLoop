import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TransactionService } from '../../services/transaction.service';
import { ItemService } from '../../../items/services/item';
import { AuthService, User } from '../../../../core/services/auth.service';
import { Item } from '../../../items/models/item.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-transaction-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transaction-create.component.html',
  styleUrl: './transaction-create.component.css'
})
export class TransactionCreateComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private itemService = inject(ItemService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  items: Item[] = [];
  currentUser: User | null = null;
  loadingData: boolean = true;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  formData = {
    itemId: '',
    donorOrSellerId: '',
    receiverId: '',
    requestId: '',
    handshakeOTP: '',
    status: 'pending' as const
  };

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser && this.currentUser._id) {
      this.formData.donorOrSellerId = this.currentUser._id;
    }

    this.loadAvailableItems();
  }

  loadAvailableItems(): void {
    this.loadingData = true;
    this.itemService.getAllItems({ limit: 100 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loadingData = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          const raw = res?.data;
          if (Array.isArray(raw)) {
            this.items = raw;
          } else if (Array.isArray(res)) {
            this.items = res;
          } else {
            this.items = [];
          }
        },
        error: (err) => {
          console.error('Failed to fetch available items:', err);
          this.errorMessage = 'Unable to load list of available items';
        }
      });
  }

  onItemSelect(itemId: string): void {
    const selected = this.items.find(i => i._id === itemId);
    if (selected) {
      // If the selected item has an ownerId and user is not set, set donorOrSellerId from owner
      if (typeof selected.ownerId === 'object' && selected.ownerId._id) {
        this.formData.donorOrSellerId = selected.ownerId._id;
      } else if (typeof selected.ownerId === 'string' && selected.ownerId) {
        this.formData.donorOrSellerId = selected.ownerId;
      }
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.itemId.trim() &&
      this.formData.donorOrSellerId.trim() &&
      this.formData.receiverId.trim()
    );
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill out all required fields (Item, Donor/Seller, and Receiver)';
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      itemId: this.formData.itemId.trim(),
      donorOrSellerId: this.formData.donorOrSellerId.trim(),
      receiverId: this.formData.receiverId.trim(),
      status: this.formData.status
    };

    if (this.formData.requestId.trim()) {
      payload.requestId = this.formData.requestId.trim();
    }
    if (this.formData.handshakeOTP.trim()) {
      payload.handshakeOTP = this.formData.handshakeOTP.trim();
    }

    this.transactionService.createTransaction(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          const created = res?.data || res;
          this.toastService.success('Transaction created successfully!');
          if (created && created._id) {
            this.router.navigate(['/transactions', created._id]);
          } else {
            this.router.navigate(['/transactions']);
          }
        },
        error: (err) => {
          console.error('Failed to create transaction:', err);
          const msg = err.error?.message || 'Error creating transaction. Please ensure all ObjectIds are valid.';
          this.errorMessage = msg;
          this.toastService.error(msg);
        }
      });
  }
}
