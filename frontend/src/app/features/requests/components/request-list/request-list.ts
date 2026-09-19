import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../services/request';
import { Request } from '../../models/request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './request-list.html',
  styleUrl: './request-list.css'
})
export class RequestList implements OnInit {
  private requestService = inject(RequestService);

  requests = signal<Request[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // قواميس ترجمة المواقع
  private governoratesMap: Record<string, string> = {
    Alexandria: 'الإسكندرية',
    Cairo: 'القاهرة',
    Giza: 'الجيزة',
    Qena: 'قنا',
    Luxor: 'الأقصر'
  };

  private citiesMap: Record<string, string> = {
    Alexandria: 'الإسكندرية',
    Miami: 'ميامي',
    'Sidi Gaber': 'سيدي جابر',
    'Nasr City': 'مدينة نصر',
    Smouha: 'سموحة',
    Dokki: 'الدقي',
    Qous: 'قوص',
    Dandara: 'دندرة'
  };

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set('');

    this.requestService.getRequests().subscribe({
      next: (res: any) => {
        console.log('✅ استجابة سيرفر الطلبات:', res);

        // استخراج المصفوفة مهما كان شكل التغليف من الباك إند
        let data: Request[] = [];
        if (Array.isArray(res)) {
          data = res;
        } else if (Array.isArray(res?.data)) {
          data = res.data;
        } else if (Array.isArray(res?.data?.requests)) {
          data = res.data.requests;
        } else if (Array.isArray(res?.requests)) {
          data = res.requests;
        }

        this.requests.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ تفاصيل خطأ جلب الطلبات:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          message: err.message,
          errorResponse: err.error
        });

        if (err.status === 401) {
          this.error.set('يرجى تسجيل الدخول أولاً لعرض الطلبات.');
        } else if (err.status === 404) {
          this.error.set('مسار خدمة الطلبات غير متوفر على السيرفر (404).');
        } else if (err.status === 500) {
          this.error.set('حدث خطأ داخلي في الخادم أثناء جلب الطلبات (500).');
        } else {
          this.error.set('تعذر تحميل الطلبات، يرجى المحاولة لاحقاً.');
        }

        this.loading.set(false);
      }
    });
  }

  getGovernorate(governorate?: string): string {
    if (!governorate) return '';
    return this.governoratesMap[governorate] || governorate;
  }

  getCity(city?: string): string {
    if (!city) return '';
    return this.citiesMap[city] || city;
  }

  deleteRequest(id: string): void {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      return;
    }

    this.requestService.deleteRequest(id).subscribe({
      next: () => {
        this.requests.update(items => items.filter(r => (r as any)._id !== id));
      },
      error: (err) => {
        console.error('❌ خطأ حذف الطلب:', err);
        alert('حدث خطأ أثناء حذف الطلب، يرجى المحاولة لاحقاً.');
      }
    });
  }
}