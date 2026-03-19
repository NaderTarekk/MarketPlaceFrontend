// src/app/modules/home/services/home.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import { ApiResponse } from '../../../models/products';


export interface ApiBanner {
  id: number;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  imageUrl: string;
  buttonText: string;
  buttonTextAr: string;
  buttonLink: string;
  displayOrder?: number;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = `${environment.baseApi}/api/Home`;

  constructor(private http: HttpClient) {}

  getBanners(): Observable<ApiResponse<any[]>> {
  return this.http.get<ApiResponse<any[]>>(`${environment.baseApi}/api/Banners?activeOnly=true`);
}

  getFeaturedSections(): Observable<any> {
    return this.http.get(`${this.apiUrl}/featured-sections`);
  }

getTopSelling(limit: number = 12): Observable<any> {
  return this.http.get(`${this.apiUrl}/top-selling?limit=${limit}`);
}

  getSectionProducts(sectionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sections/${sectionId}/products`);
  }

  getTestimonials(): Observable<any> {
    return this.http.get(`${this.apiUrl}/testimonials`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  subscribeNewsletter(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/newsletter/subscribe`, { email });
  }

  // إضافة method للـ categories (للـ navbar)
  getCategories(onlyParents: boolean = false): Observable<any> {
    return this.http.get(`${environment.baseApi}/api/Categories`, {
      params: { onlyParents: onlyParents.toString() }
    });
  }
}