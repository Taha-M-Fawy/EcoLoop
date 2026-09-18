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

  // قواميس ترجمة المواقع فقط (إذا كانت تأتي بالإنجليزية من الـ Backend)
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
        // دعم استخراج المصفوفة سواء رجعت كـ Array مباشرة أو داخل { data: [...] }
        const data = Array.isArray(res) ? res : (res?.data?.requests || res?.data || []);
        this.requests.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Request fetch error:', err);
        this.error.set('تعذر تحميل الطلبات، يرجى المحاولة لاحقاً.');
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
        console.error('Delete request error:', err);
        this.error.set('حدث خطأ أثناء حذف الطلب.');
      }
    });
  }
}