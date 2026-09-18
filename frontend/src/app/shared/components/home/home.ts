import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../../features/items/services/item';
import { LocationService } from '../../../core/services/location.service';
import { CategorySummary, Item } from '../../../features/items/models/item.model';
import { ItemCardComponent } from '../../../features/items/components/item-card/item-card';

export interface CategoryVisual {
  path: string;
  bgClass: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ItemCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private itemService = inject(ItemService);
  private locationService = inject(LocationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  searchQuery = '';
  selectedGov = '';

  loadingCategories = true;
  loadingLatest = true;

  categories: CategorySummary[] = [];
  governorates: string[] = [];
  latestItems: Item[] = [];

  ngOnInit(): void {
    this.loadCategories();
    this.loadGovernorates();
    this.loadLatestItems();
  }

  // 1. جلب التصنيفات ديناميكياً من الباك إند
  loadCategories(): void {
    this.loadingCategories = true;
    this.itemService.getCategories().subscribe({
      next: (res: any) => {
        const data = res?.data?.categories || res?.data || (Array.isArray(res) ? res : []);
        this.categories = Array.isArray(data) ? data : [];
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('فشل تحميل الأقسام:', err);
        this.loadingCategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 2. جلب المحافظات ديناميكياً عبر LocationService
  loadGovernorates(): void {
    this.locationService.getLocations().subscribe({
      next: (res: any) => {
        const locations = Array.isArray(res?.data) ? res.data : [];
        this.governorates = locations.map((loc: any) => loc.governorate);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('فشل تحميل المحافظات:', err);
      }
    });
  }

  // 3. جلب أحدث السلع المعروضة
  loadLatestItems(): void {
    this.loadingLatest = true;
    this.itemService.getAllItems({ limit: 3 } as any).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.latestItems = res;
        } else if (Array.isArray(res?.data)) {
          this.latestItems = res.data;
        } else if (Array.isArray(res?.data?.items)) {
          this.latestItems = res.data.items;
        } else if (Array.isArray(res?.items)) {
          this.latestItems = res.items;
        } else {
          this.latestItems = [];
        }

        this.loadingLatest = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('فشل تحميل أحدث السلع:', err);
        this.loadingLatest = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    const queryParams: any = {};
    if (this.searchQuery.trim()) queryParams.search = this.searchQuery.trim();
    if (this.selectedGov) queryParams.governorate = this.selectedGov;
    this.router.navigate(['/items'], { queryParams });
  }

  // إرجاع أيقونة SVG نظيفة ومسارها مع الخلفية المتناسقة
  getCategoryMeta(name: string): CategoryVisual {
    const n = (name || '').toLowerCase();

    // أجهزة وإلكترونيات
    if (n.includes('elec') || n.includes('أجهز') || n.includes('حاسوب') || n.includes('موبايل')) {
      return {
        path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        bgClass: 'bg-blue-50 text-blue-600'
      };
    }

    // كتب ومراجع ومذكرات
    if (n.includes('book') || n.includes('كتب') || n.includes('دراس') || n.includes('مراجع')) {
      return {
        path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        bgClass: 'bg-amber-50 text-amber-600'
      };
    }

    // ملابس وأقمشة
    if (n.includes('cloth') || n.includes('ملابس') || n.includes('أقمشة')) {
      return {
        path: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
        bgClass: 'bg-purple-50 text-purple-600'
      };
    }

    // أدوية ومستلزمات طبية
    if (n.includes('med') || n.includes('دواء') || n.includes('طب') || n.includes('صحة') || n.includes('مستلزمات')) {
      return {
        path: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        bgClass: 'bg-rose-50 text-rose-600'
      };
    }

    // أثاث ومنزليات
    if (n.includes('منزل') || n.includes('أثاث') || n.includes('ديكور')) {
      return {
        path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        bgClass: 'bg-emerald-50 text-emerald-600'
      };
    }

    // افتراضي (صندوق بضائع عام)
    return {
      path: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      bgClass: 'bg-slate-100 text-slate-700'
    };
  }
}