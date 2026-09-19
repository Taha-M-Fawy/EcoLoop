import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  user: any = {
    location: {
      city: '',
      country: ''
    },
    password: ''
  };

  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    const user = this.authService.getUser();

    if (!user?._id) {
      return;
    }

    this.http.get<any>(
      `http://localhost:5000/api/users/${user._id}`
    ).subscribe({
      next: (data) => {
        this.user = {
          ...data,
          location: data.location || {
            city: '',
            country: ''
          },
          password: ''
        };

        this.confirmPassword = '';

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Profile Error:', err);
      }
    });
  }

  updateProfile() {
    const user = this.authService.getUser();

    if (!user?._id) {
      return;
    }

    if (this.user.password && this.user.password !== this.confirmPassword) {
      alert('كلمتا المرور غير متطابقتين');
      return;
    }

    const updateData: any = {
      username: this.user.username,
      email: this.user.email,
      phone: this.user.phone,
      location: this.user.location,
      bio: this.user.bio
    };

    if (this.user.password) {
      updateData.password = this.user.password;
    }

    this.http.put(
      `http://localhost:5000/api/users/${user._id}`,
      updateData
    ).subscribe({
      next: (data: any) => {

        this.user = {
          ...data,
          location: data.location || {
            city: '',
            country: ''
          },
          password: ''
        };

        this.confirmPassword = '';

        this.authService.saveSession(
          this.authService.getToken()!,
          data
        );

        alert('تم تحديث بياناتك بنجاح');

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Update Profile Error:', err);
        alert(err.error?.message || 'حدث خطأ أثناء تحديث البيانات');
      }
    });
  }
}