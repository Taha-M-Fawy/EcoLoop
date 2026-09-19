import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestService } from '../../services/request';
import { Request } from '../../models/request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
   imports: [CommonModule, RouterLink],
  templateUrl: './request-list.html',
  styleUrl: './request-list.css'
})
export class RequestList implements OnInit {
  private requestService = inject(RequestService);
  private cdr = inject(ChangeDetectorRef);

  requests: Request[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = '';

    console.log('LOAD REQUESTS STARTED');

    this.requestService.getRequests().subscribe({
     next: (data) => {
  console.log('API DATA:', data);

  this.requests = [...data];

  this.loading = false;

  console.log('LOADING AFTER DATA:', this.loading);
  console.log('REQUESTS COUNT:', this.requests.length);

  this.cdr.detectChanges();
},
      error: (err) => {
        console.error('API ERROR:', err);
        this.error = 'Failed to load requests';
        this.loading = false;
      },
      complete: () => {
        console.log('API REQUEST COMPLETED');
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
    if (!confirm('هل أنتِ متأكدة من حذف هذا الطلب؟')) {
      return;
    }

    this.requestService.deleteRequest(id).subscribe({
      next: () => {
        this.requests = this.requests.filter(request => request._id !== id);
      },
      error: (err) => {
        console.error(err);
        this.error = 'حدث خطأ أثناء حذف الطلب';
      }
    });
  }
}