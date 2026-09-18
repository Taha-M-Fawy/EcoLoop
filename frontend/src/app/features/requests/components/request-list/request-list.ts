import { Component, OnInit, inject } from '@angular/core';
import { RequestService } from '../../services/request';
import { Request } from '../../models/request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [],
  templateUrl: './request-list.html',
  styleUrl: './request-list.css'
})
export class RequestList implements OnInit {
  private requestService = inject(RequestService);

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
    this.requests = data;
    this.loading = false;
console.log('LOADING AFTER DATA:', this.loading);
console.log('REQUESTS COUNT:', this.requests.length);
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