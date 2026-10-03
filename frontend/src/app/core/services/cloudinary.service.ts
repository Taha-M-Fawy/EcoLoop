import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CloudinaryResponse {
  asset_id: string;
  public_id: string;
  version: number;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);
  private readonly uploadUrl = environment.cloudinary.uploadUrl;
  private readonly uploadPreset = environment.cloudinary.uploadPreset;

  /**
   * رفع صورة واحدة مباشرة إلى Cloudinary
   */
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<CloudinaryResponse>(this.uploadUrl, formData).pipe(
      map(response => response.secure_url)
    );
  }

  /**
   * رفع مجموعة صور بشكل متوازي
   */
  async uploadMultiple(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => firstValueFrom(this.uploadImage(file)));
    return Promise.all(uploadPromises);
  }

  /**
   * تحسين رابط Cloudinary للحصول على أفضل سرعة وحجم مضغوط
   */
  getOptimizedUrl(url: string, width = 450): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }
    // حقن معلمات التحسين التلقائي والضغط الذكي
    return url.replace('/upload/', `/upload/w_${width},c_fill,q_auto,f_auto/`);
  }
}
