import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-details.html',
  styleUrl: './item-details.css',
})
export class ItemDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private toast = inject(ToastService);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  item: any = null;
  loading = true;
  selectedImage: string | null = null;
  fallbackImg = 'https://placehold.co/600x400/png';

  get currentUser(): any {
    return this.authService.currentUserValue;
  }

  get currentUserId(): string | null {
    const user = this.currentUser;
    return user?._id || user?.id || null;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isOwner = false;

  get canManageItem(): boolean {
    return Boolean(this.isAdmin || this.isOwner);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadItem(id);
    } else {
      this.toast.error('معرّف السلعة غير صحيح');
      this.router.navigate(['/items']);
    }
  }

  loadItem(id: string): void {
    this.loading = true;
    this.itemService.getItemById(id).subscribe({
      next: (res: any) => {
        const data = res?.data?.item || res?.item || res?.data || res;
        this.item = data;

        if (this.item?.images && Array.isArray(this.item.images) && this.item.images.length > 0) {
          this.selectedImage = this.item.images[0];
        } else {
          this.selectedImage = this.fallbackImg;
        }

        const ownerId = this.item?.ownerId?._id || this.item?.ownerId?.id || this.item?.ownerId;
        this.isOwner = Boolean(
          this.currentUserId && String(ownerId) === String(this.currentUserId),
        );

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error('فشل تحميل تفاصيل السلعة');
        console.error('Error loading item:', err);
        this.cdr.detectChanges();
      },
    });
  }

  getConditionLabel(condition: string): string {
    const map: Record<string, string> = {
      new: 'جديد تماماً',
      like_new: 'كالجديد (شبه جديد)',
      used_good: 'مستعمل بحالة جيدة',
      used_fair: 'مستعمل بحالة مقبولة',
    };
    return map[condition] || condition || 'غير محدد';
  }

  goBack(): void {
    this.location.back();
  }

  editItem(): void {
    if (!this.canManageItem) {
      this.toast.error('غير مصرح لك بتعديل هذه السلعة');
      return;
    }
    this.router.navigate(['/items/edit', this.item._id]);
  }

  deleteItem(): void {
    if (!this.canManageItem) {
      this.toast.error('غير مصرح لك بحذف هذه السلعة');
      return;
    }

    const message = this.isAdmin && !this.isOwner 
      ? 'هل أنت متأكد من رغبتك كـ مسؤول (Admin) في حذف هذه السلعة نهائياً؟'
      : 'هل أنت متأكد من رغبتك في حذف هذه السلعة نهائياً؟';

    if (confirm(message)) {
      this.itemService.deleteItem(this.item._id).subscribe({
        next: () => {
          this.toast.success('تم حذف السلعة بنجاح');
          this.router.navigate(['/items']);
        },
        error: (err) => {
          this.toast.error('حدث خطأ أثناء محاولة الحذف');
          console.error('Delete item error:', err);
        },
      });
    }
  }

  onRequestItem(): void {
    if (!this.currentUserId) {
      this.toast.error('يرجى تسجيل الدخول أولاً لتتمكن من إتمام الطلب والتواصل');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isOwner) {
      this.toast.error('لا يمكنك طلب سلعة تمتلكها بالفعل');
      return;
    }

    if (this.item.type === 'exchange') {
      this.toast.success('تم إرسال إشعار لصاحب السلعة بطلب المقايضة والتواصل');
    } else if (this.item.type === 'donation') {
      this.toast.success('تم إرسال طلب استلام التبرع بنجاح');
    } else {
      this.toast.success('تم فتح قناة التواصل مع البائع');
    }
  }
}