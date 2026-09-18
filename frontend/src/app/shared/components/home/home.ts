import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../../features/items/services/item';
import { LocationService } from '../../../core/services/location.service';
import { CategorySummary, Item } from '../../../features/items/models/item.model';
import { ItemCardComponent } from '../../../features/items/components/item-card/item-card';

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

  // مابينج بسيط للأيقونات التعبيرية في حال عدم توفر صورة بالداتابيز
  getCategoryIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('med') || n.includes('دواء') || n.includes('طب')) return '💊';
    if (n.includes('book') || n.includes('كتب') || n.includes('دراس')) return '📚';
    if (n.includes('elec') || n.includes('أجهز') || n.includes('حاسوب')) return '💻';
    if (n.includes('cloth') || n.includes('ملابس')) return '👕';
    return '📦';
  }
}