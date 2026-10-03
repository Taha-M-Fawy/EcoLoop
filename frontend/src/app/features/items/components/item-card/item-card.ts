import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Item } from '../../models/item.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './item-card.html',
  styleUrl: './item-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCardComponent {
  private authService = inject(AuthService);

  @Input({ required: true }) item!: Item;
  @Input() priority = false;

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
    const raw = this.item?.images?.[0];
    if (!raw) return '';
    if (raw.includes('images.unsplash.com')) {
      if (raw.includes('w=')) {
        return raw.replace(/w=\d+/, 'w=450').replace(/q=\d+/, 'q=75');
      }
      return `${raw}&w=450&q=75`;
    }
    if (raw.includes('cloudinary.com') && raw.includes('/upload/')) {
      return raw.replace('/upload/', '/upload/w_450,c_fill,q_auto,f_auto/');
    }
    return raw;
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