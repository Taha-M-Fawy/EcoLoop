import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { RequestService } from '../../services/request';
import { Request } from '../../models/request.model';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TransactionService } from '../../../transactions/services/transaction';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './request-list.html',
  styleUrl: './request-list.css'
})
export class RequestList implements OnInit {
  private requestService = inject(RequestService);
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  requests: Request[] = [];
  loading = true;
  error = '';
  actionLoading: { [id: string]: boolean } = {};

  filterUrgency: string = 'all';
  filterStatus: string = 'all';

  get currentUserId(): string {
    const user = this.authService.currentUserValue;
    return user?._id || user?.id || '';
  }

  get isAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'admin';
  }

  isOwner(request: Request): boolean {
    const currentId = this.currentUserId;
    if (!currentId) return false;
    const requester = request.userId as any;
    if (!requester) return false;
    const requesterId = requester?._id || requester?.id || (typeof requester === 'string' ? requester : null);
    if (!requesterId) return false;
    return String(requesterId).trim() === String(currentId).trim();
  }

  getRequesterName(request: Request): string {
    const user = request.userId as any;
    if (!user) return 'عضو بالمنصة';
    if (typeof user === 'string') return 'عضو بالمنصة';
    return user.name || user.username || 'عضو بالمنصة';
  }

  get filteredRequests(): Request[] {
    return this.requests.filter(req => {
      const matchUrgency = this.filterUrgency === 'all' || req.urgency === this.filterUrgency;
      const matchStatus = this.filterStatus === 'all' || req.status === this.filterStatus;
      return matchUrgency && matchStatus;
    });
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = '';

    this.requestService.getRequests().subscribe({
      next: (data) => {
        this.requests = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API ERROR:', err);
        this.error = 'فشل تحميل الطلبات، يرجى المحاولة لاحقاً';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  offerRequest(request: Request): void {
    if (!request._id) return;
    const reqId = request._id;

    if (!this.currentUserId) {
      this.toast.error('يرجى تسجيل الدخول أولاً لتتمكن من تقديم عرض المساعدة');
      this.router.navigate(['/auth/login']);
      return;
    }

    const requester = request.userId as any;
    const requesterId = requester?._id || requester?.id || requester;

    if (String(requesterId) === String(this.currentUserId)) {
      this.toast.error('لا يمكنك تقديم عرض مساعدة لطلبك الشخصي');
      return;
    }

    this.actionLoading[reqId] = true;

    this.transactionService.createTransaction({
      requestId: reqId,
      donorOrSellerId: this.currentUserId,
      receiverId: requesterId
    }).subscribe({
      next: () => {
        this.actionLoading[reqId] = false;
        this.toast.success('تم تقديم عرض المساعدة بنجاح! تم إنشاء المعاملة.');
        this.router.navigate(['/transactions']);
      },
      error: (err) => {
        this.actionLoading[reqId] = false;
        console.error('Offer request error:', err);
        this.toast.error(err?.error?.message || 'فشل في تقديم عرض المساعدة');
      }
    });
  }

  getTitle(title: string): string {
    const titles: { [key: string]: string } = {
      'Need Headphones': 'محتاج سماعة',
      'Looking for Baby Clothes': 'محتاج هدوم أطفال',
      'Looking for Programming Books': 'محتاج كتب برمجة',
      'Need a Laptop': 'محتاج لابتوب',
      'Winter Clothes Needed': 'محتاج هدوم شتوية',
      'Looking for Engineering Books': 'محتاج كتب هندسة'
    };

    return titles[title] || title;
  }

  getDescription(description: string): string {
    const descriptions: { [key: string]: string } = {
      'Looking for headphones in good working condition.':
        'بدور على سماعة تكون حالتها كويسة وتشتغل تمام.',

      'I am looking for clean baby clothes in good condition.':
        'بدور على هدوم أطفال نضيفة وحالتها كويسة.',

      'I am looking for used programming books about JavaScript and Node.js.':
        'بدور على كتب برمجة مستعملة عن JavaScript و Node.js.',

      'I am looking for a used laptop in good condition for studying and programming.':
        'محتاج لابتوب مستعمل بحالة كويسة للمذاكرة والبرمجة.',

      'Looking for clean winter clothes in good condition.':
        'بدور على هدوم شتوية نضيفة وحالتها كويسة.',

      'I need university engineering books for studying.':
        'محتاج كتب هندسة جامعية للمذاكرة.',

      'I am looking for used programming books.':
        'بدور على كتب برمجة مستعملة.'
    };

    return descriptions[description] || description;
  }

  getGovernorate(governorate: string): string {
    const governorates: { [key: string]: string } = {
      Alexandria: 'الإسكندرية',
      Cairo: 'القاهرة',
      Giza: 'الجيزة'
    };

    return governorates[governorate] || governorate;
  }

  getCity(city: string): string {
    const cities: { [key: string]: string } = {
      Alexandria: 'الإسكندرية',
      Miami: 'ميامي',
      'Sidi Gaber': 'سيدي جابر',
      'Nasr City': 'مدينة نصر',
      Smouha: 'سموحة',
      Dokki: 'الدقي'
    };

    return cities[city] || city;
  }

  deleteRequest(id: string): void {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      return;
    }

    this.requestService.deleteRequest(id).subscribe({
      next: () => {
        this.requests = this.requests.filter(request => request._id !== id);
        this.toast.success('تم حذف الطلب بنجاح');
      },
      error: (err) => {
        console.error(err);
        this.error = 'حدث خطأ أثناء حذف الطلب';
        this.toast.error('حدث خطأ أثناء حذف الطلب');
      }
    });
  }
}