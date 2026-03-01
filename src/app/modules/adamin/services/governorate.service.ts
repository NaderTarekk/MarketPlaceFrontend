// ═══════════════════════════════════════════════════════════════════════════
// FILE: src/app/modules/shared/services/governorate.service.ts
// ═══════════════════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

export interface Governorate {
  id: number;
  nameAr: string;
  nameEn: string;
  shippingCost: number;
  isFreeShipping: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateGovernorate {
  nameAr: string;
  nameEn: string;
  shippingCost: number;
  isFreeShipping?: boolean;
  sortOrder?: number;
}

export interface UpdateGovernorate {
  nameAr?: string;
  nameEn?: string;
  shippingCost?: number;
  isFreeShipping?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class GovernorateService {
  private apiUrl = `${environment.baseApi}/api/Governorates`;

  constructor(private http: HttpClient) {}

  // ═══════════════════════════════════════════════
  // PUBLIC ENDPOINTS
  // ═══════════════════════════════════════════════

  // Get all governorates (for checkout dropdown)
  getAll(activeOnly: boolean = true): Observable<ApiResponse<Governorate[]>> {
    return this.http.get<ApiResponse<Governorate[]>>(`${this.apiUrl}?activeOnly=${activeOnly}`);
  }

  // Get shipping cost for specific governorate
  getShippingCost(id: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/${id}/shipping-cost`);
  }

  // ═══════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════

  // Get governorate by ID
  getById(id: number): Observable<ApiResponse<Governorate>> {
    return this.http.get<ApiResponse<Governorate>>(`${this.apiUrl}/${id}`);
  }

  // Create new governorate
  create(data: CreateGovernorate): Observable<ApiResponse<Governorate>> {
    return this.http.post<ApiResponse<Governorate>>(this.apiUrl, data);
  }

  // Update governorate
  update(id: number, data: UpdateGovernorate): Observable<ApiResponse<Governorate>> {
    return this.http.put<ApiResponse<Governorate>>(`${this.apiUrl}/${id}`, data);
  }

  // Delete governorate
  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  // Seed all Egyptian governorates (27 governorates)
  seedGovernorates(): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, {});
  }
}