import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Item } from '../../models/item.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-card.html',
  styleUrl: './item-card.css'
})
export class ItemCardComponent {
  private authService = inject(AuthService);

  @Input({ required: true }) item!: Item;

  imageFailed = false;

  onImageError(): void {
    this.imageFailed = true;
  }

  get isOwner(): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    const currentId = currentUser._id || (currentUser as any)?.id;
    const ownerId = typeof this.item?.ownerId === 'object' 
      ? (this.item.ownerId as any)?._id 
      : this.item?.ownerId;
    return Boolean(currentId && String(currentId) === String(ownerId));
  }

  get hasValidImage(): boolean {
    const img = this.item?.images?.[0];
    return !!img && !img.includes('placeholder.co') && !this.imageFailed;
  }

  get primaryImage(): string {
    return this.item?.images?.[0] || '';
  }

  formatCondition(condition?: string): string {
    const map: Record<string, string> = {
      new: 'جديد',
      like_new: 'كالجديد',
      used_good: 'مستعمل بحالة جيدة',
      used_fair: 'مستعمل بحالة مقبولة'
    };
    return map[condition || ''] || condition || 'مستعمل';
  }

  getTypeBadge(type?: string): { label: string; class: string } {
    switch (type) {
      case 'donation':
        return { label: 'تبرع مجاني', class: 'bg-emerald-500 text-white' };
      case 'exchange':
        return { label: 'تبادل', class: 'bg-blue-500 text-white' };
      case 'sell':
        return { 
          label: this.item?.price ? `${this.item.price} ج.م` : 'بيع رمزي', 
          class: 'bg-amber-500 text-white' 
        };
      default:
        return { label: 'معروض', class: 'bg-slate-500 text-white' };
    }
  }
}