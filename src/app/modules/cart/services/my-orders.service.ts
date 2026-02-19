import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, CreateOrderDto } from '../../../models/my-orders';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class MyOrdersService {
  
  constructor(private http: HttpClient) {}

  // ══════════════════════════════════════════════════════════
  // Customer Endpoints
  // ══════════════════════════════════════════════════════════

  createOrder(dto: CreateOrderDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(environment.orderUrl, dto);
  }

  getMyOrders(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.orderUrl}/my-orders`);
  }

  getOrderById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.orderUrl}/${id}`);
  }

  cancelOrder(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.orderUrl}/${id}/cancel`, {});
  }

  // ══════════════════════════════════════════════════════════
  // Vendor Endpoints
  // ══════════════════════════════════════════════════════════

  getVendorOrders(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.orderUrl}/vendor`);
  }

  // ══════════════════════════════════════════════════════════
  // Admin Endpoints
  // ══════════════════════════════════════════════════════════

  getAllOrders(filters?: any): Observable<ApiResponse<any>> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          queryParams.append(key, filters[key]);
        }
      });
      params = `?${queryParams.toString()}`;
    }
    return this.http.get<ApiResponse<any>>(`${environment.orderUrl}${params}`);
  }

  updateOrderStatus(id: number, status: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${environment.orderUrl}/${id}/status`, status);
  }

  assignDeliveryAgent(id: number, agentId: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${environment.orderUrl}/${id}/assign-agent`, JSON.stringify(agentId), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // ══════════════════════════════════════════════════════════
  // Delivery Agent Endpoints
  // ══════════════════════════════════════════════════════════

  getAgentOrders(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.orderUrl}/delivery`);
  }

  updateDeliveryStatus(id: number, status: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${environment.orderUrl}/${id}/delivery-status`, status);
  }
}
