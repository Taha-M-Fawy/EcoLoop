import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ItemService } from '../../services/item';
import { Item, ItemFilters, CategorySummary } from '../../models/item.model';
import { ItemCardComponent } from '../item-card/item-card';
import { LocationService } from '../../../../core/services/location.service';
import { LocationItem } from '../../../../core/models/location.model';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemCardComponent],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemListComponent implements OnInit {
  private itemService = inject(ItemService);
  private locationService = inject(LocationService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  items: Item[] = [];
  categories: CategorySummary[] = [];
  loading = false;

  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  readonly pageSize = 8;

  filters: ItemFilters & { owner?: string } = {
    type: 'all',
    categoryId: '',
    governorate: '',
    city: '',
    search: '',
    owner: '',
  };

  locationsData: LocationItem[] = [];
  governorates: string[] = [];
  availableCities: string[] = [];

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadLocations();
    this.loadCategories();

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.filters.categoryId = params['categoryId'] || params['category'] || '';
        this.filters.type = params['type'] || 'all';
        this.filters.governorate = params['governorate'] || '';
        this.filters.city = params['city'] || '';
        this.filters.search = params['search'] || '';
        this.filters.owner = params['owner'] || '';
        this.currentPage = Number(params['page']) || 1;

        this.updateAvailableCities();
        this.loadItems();
      });
  }

  onSearchInput(value: string): void {
    this.filters.search = value;

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.applyFilters();
    }, 400);
  }

  private updateAvailableCities(): void {
    if (this.filters.governorate && this.locationsData.length > 0) {
      const selected = this.locationsData.find(
        (loc) => loc.governorate === this.filters.governorate
      );

      this.availableCities = selected ? selected.cities : [];
    } else if (!this.filters.governorate) {
      this.availableCities = [];
    }
  }

  loadLocations(): void {
    this.locationService
      .getLocations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.locationsData = Array.isArray(res?.data) ? res.data : [];
          this.governorates = this.locationsData.map(
            (loc) => loc.governorate
          );

          this.updateAvailableCities();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('فشل تحميل المحافظات:', err),
      });
  }

  loadCategories(): void {
    this.itemService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.categories = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];

          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load categories:', err),
      });
  }

  onGovChange(): void {
    this.filters.city = '';
    this.updateAvailableCities();
    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.syncUrlParams();
  }

  goToPage(page: number): void {
    if (
      page >= 1 &&
      page <= this.totalPages &&
      page !== this.currentPage
    ) {
      this.currentPage = page;
      this.syncUrlParams();

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  private syncUrlParams(): void {
    const queryParams: Record<string, any> = {};

    if (this.filters.owner) {
      queryParams['owner'] = this.filters.owner;
    }

    if (this.filters.categoryId) {
      queryParams['categoryId'] = this.filters.categoryId;
    }

    if (this.filters.type && this.filters.type !== 'all') {
      queryParams['type'] = this.filters.type;
    }

    if (this.filters.governorate) {
      queryParams['governorate'] = this.filters.governorate;
    }

    if (this.filters.city) {
      queryParams['city'] = this.filters.city;
    }

    if (this.filters.search?.trim()) {
      queryParams['search'] = this.filters.search.trim();
    }

    if (this.currentPage > 1) {
      queryParams['page'] = this.currentPage;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '',
    });
  }

  get pagesArray(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
  }

  loadItems(): void {
    this.loading = true;

    const queryParams: Record<string, any> = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    if (this.filters.owner) {
      queryParams['owner'] = this.filters.owner;

      const userStr = localStorage.getItem('user');

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userId = user._id || user.id;

          if (userId) {
            queryParams['ownerId'] = userId;
          }
        } catch {
        }
      }
    }

    if (this.filters.categoryId) {
      queryParams['categoryId'] = this.filters.categoryId;
      queryParams['category'] = this.filters.categoryId;
    }

    if (this.filters.type && this.filters.type !== 'all') {
      queryParams['type'] = this.filters.type;
    }

    if (this.filters.governorate) {
      queryParams['governorate'] = this.filters.governorate;
    }

    if (this.filters.city) {
      queryParams['city'] = this.filters.city;
    }

    if (this.filters.search?.trim()) {
      queryParams['search'] = this.filters.search.trim();
    }

    this.itemService
      .getAllItems(queryParams)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          const rawItems = response?.data;

          if (Array.isArray(rawItems)) {
            this.items = rawItems;
          } else if (Array.isArray(response)) {
            this.items = response;
          } else {
            this.items = [];
          }

          const paginationData = response?.pagination;

          if (paginationData) {
            this.currentPage =
              Number(paginationData.page) || this.currentPage;

            this.totalPages =
              Number(paginationData.pages) || 1;

            this.totalItems =
              Number(paginationData.total) || this.items.length;
          } else {
            this.totalPages = 1;
            this.totalItems = this.items.length;
          }
        },
        error: (err) => {
          console.error(
            'فشل جلب المعروضات من السيرفر:',
            err
          );

          this.items = [];
          this.totalPages = 1;
          this.totalItems = 0;
        },
      });
  }
}