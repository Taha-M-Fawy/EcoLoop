import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ItemService } from '../../../features/items/services/item';
import { CategorySummary } from '../../../features/items/models/item.model';
import { NotificationService } from '../../../features/notifications/services/notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private itemService = inject(ItemService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchQuery = '';
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  isMobileMenuOpen = signal(false);
  isCategoriesDropdownOpen = signal(false);
  isUserMenuOpen = signal(false);
  isItemsPage = signal(false);
  categories = signal<CategorySummary[]>([]);

  currentUser = signal<any>(null);
  isLoggedIn = signal<boolean>(false);
  unreadNotificationsCount = signal<number>(0);

  userName = computed(() => {
    const user = this.currentUser();
    return user?.name || user?.username || 'حسابي';
  });

  userInitial = computed(() => {
    return this.userName().trim().charAt(0).toUpperCase() || 'U';
  });

  ngOnInit(): void {
    this.syncAuthState();
    this.notificationService.refreshUnreadCount();

this.notificationService.unreadCount$.subscribe((count) => {
  this.unreadNotificationsCount.set(count);
});

    if ((this.authService as any).currentUser$) {
      (this.authService as any).currentUser$.subscribe((user: any) => {
        if (user) {
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
        } else {
          this.syncAuthState();
        }
      });
    }

    // مزامنة حقل البحث مع الـ URL عند التحميل أو الرجوع
    this.route.queryParams.subscribe(params => {
      if (params['search'] !== undefined) {
        this.searchQuery = params['search'];
      }
    });

    // مراقبة الكتابة لايف مع تأخير بسيط (Debounce) لمنع الضغط على السيرفر
    this.searchSub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.executeSearch(term);
    });

    this.checkIfItemsPage(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkIfItemsPage(event.urlAfterRedirects || event.url);
        this.syncAuthState();
      });

    this.loadCategories();
  }

  private loadUnreadNotifications(): void {
  if (!this.isLoggedIn()) {
    this.unreadNotificationsCount.set(0);
    return;
  }

  this.notificationService.getUnreadCount().subscribe({
    next: (count) => {
      this.unreadNotificationsCount.set(count);
    },
    error: () => {
      this.unreadNotificationsCount.set(0);
    }
  });
}

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  // تُستدعى مع كل حرف يُكتب في الـ input
  onSearchInput(val: string): void {
    this.searchSubject.next(val);
  }

  // زر مسح البحث (يرجع الكل فوراً)
  clearSearch(): void {
    this.searchQuery = '';
    this.executeSearch('');
  }

  private executeSearch(term: string): void {
    const cleanTerm = term.trim();
    this.router.navigate(['/items'], {
      queryParams: { 
        search: cleanTerm ? cleanTerm : null, // حذف المعامل لو الحقل فارغ
        page: 1 
      },
      queryParamsHandling: 'merge' // الحفاظ على باقي الفلاتر (المحافظة والتصنيف)
    });
  }

  private syncAuthState(): void {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token) {
      this.isLoggedIn.set(true);
      this.notificationService.refreshUnreadCount();
      if (userStr) {
        try {
          this.currentUser.set(JSON.parse(userStr));
        } catch {
          this.currentUser.set({ name: 'المستخدم' });
        }
      } else if ((this.authService as any).currentUser) {
        this.currentUser.set((this.authService as any).currentUser);
      }
    } else {
  this.isLoggedIn.set(false);
  this.currentUser.set(null);
  this.unreadNotificationsCount.set(0);
}
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
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}