import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ItemService } from '../../../features/items/services/item';
import { CategorySummary } from '../../../features/items/models/item.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  private itemService = inject(ItemService);
  private router = inject(Router);

  searchQuery = '';
  isMobileMenuOpen = signal(false);
  isCategoriesDropdownOpen = signal(false);
  isUserMenuOpen = signal(false);
  isItemsPage = signal(false);
  categories = signal<CategorySummary[]>([]);

  ngOnInit(): void {
    // التحقق من المسار الحالي ومراقبته
    this.checkIfItemsPage(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkIfItemsPage(event.urlAfterRedirects || event.url);
      });

    this.loadCategories();
  }

  private checkIfItemsPage(url: string): void {
    const cleanUrl = url.split('?')[0];
    this.isItemsPage.set(cleanUrl === '/items');
  }

  loadCategories(): void {
    this.itemService.getCategories().subscribe({
      next: (res: any) => {
        const data = res?.data?.categories || res?.data || (Array.isArray(res) ? res : []);
        this.categories.set(Array.isArray(data) ? data : []);
      },
      error: () => {}
    });
  }

  onSearch(): void {
    const term = this.searchQuery.trim();
    if (term) {
      this.router.navigate(['/items'], { queryParams: { search: term } });
    }
  }

  toggleCategoriesDropdown(): void {
    this.isCategoriesDropdownOpen.update(v => !v);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}