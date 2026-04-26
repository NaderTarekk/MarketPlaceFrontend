// src/app/modules/admin/services/banner.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Banner {
  id: number;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  imageUrl: string;
  buttonText: string;
  buttonTextAr: string;
  buttonLink: string;
  linkType: number;
  linkTargetId: number | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateBanner {
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  buttonText?: string;
  buttonTextAr?: string;
  buttonLink?: string;
  linkType?: number;
  linkTargetId?: number | null;
  displayOrder?: number;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = `${environment.baseApi}/api/Banners`;

  constructor(private http: HttpClient) {}

  getAll(activeOnly: boolean = false): Observable<ApiResponse<Banner[]>> {
    return this.http.get<ApiResponse<Banner[]>>(`${this.apiUrl}?activeOnly=${activeOnly}`);
  }

  getById(id: number): Observable<ApiResponse<Banner>> {
    return this.http.get<ApiResponse<Banner>>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateBanner, image: File): Observable<ApiResponse<Banner>> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', data.title);
    formData.append('titleAr', data.titleAr);
    formData.append('subtitle', data.subtitle || '');
    formData.append('subtitleAr', data.subtitleAr || '');
    formData.append('buttonText', data.buttonText || 'Shop Now');
    formData.append('buttonTextAr', data.buttonTextAr || 'تسوق الآن');
    formData.append('buttonLink', data.buttonLink || '/products');
    formData.append('linkType', String(data.linkType || 0));
    if (data.linkTargetId) formData.append('linkTargetId', String(data.linkTargetId));
    formData.append('displayOrder', String(data.displayOrder || 0));
    formData.append('isActive', String(data.isActive ?? true));

    return this.http.post<ApiResponse<Banner>>(this.apiUrl, formData);
  }

  update(id: number, data: CreateBanner, image?: File): Observable<ApiResponse<Banner>> {
    const formData = new FormData();
    if (image) formData.append('image', image);
    formData.append('title', data.title);
    formData.append('titleAr', data.titleAr);
    formData.append('subtitle', data.subtitle || '');
    formData.append('subtitleAr', data.subtitleAr || '');
    formData.append('buttonText', data.buttonText || 'Shop Now');
    formData.append('buttonTextAr', data.buttonTextAr || 'تسوق الآن');
    formData.append('buttonLink', data.buttonLink || '/products');
    formData.append('linkType', String(data.linkType || 0));
    if (data.linkTargetId) formData.append('linkTargetId', String(data.linkTargetId));
    formData.append('displayOrder', String(data.displayOrder || 0));
    formData.append('isActive', String(data.isActive ?? true));

    return this.http.put<ApiResponse<Banner>>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  toggle(id: number): Observable<ApiResponse<Banner>> {
    return this.http.patch<ApiResponse<Banner>>(`${this.apiUrl}/${id}/toggle`, {});
  }

  reorder(ids: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reorder`, ids);
  }
}