import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  users: any[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.http.get<any[]>('http://localhost:5000/api/users').subscribe({
      next: (data) => {
        console.log('USERS DATA:', data);

        this.users = data;
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Users Error:', err);

        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  deleteUser(id: string) {

    const confirmDelete = confirm('هل أنتِ متأكدة من حذف هذا المستخدم؟');

    if (!confirmDelete) {
      return;
    }

    this.http.delete(`http://localhost:5000/api/users/${id}`).subscribe({
      next: () => {
        this.users = this.users.filter(user => user._id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Delete User Error:', err);
        alert('حدث خطأ أثناء حذف المستخدم');
      }
    });
  }
}