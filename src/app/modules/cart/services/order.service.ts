import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient } from '@angular/common/http';
import { CancelOrderDto, CreateOrderDto, ReportDeliveryFailureDto, SetCustomerChoiceDto } from '../../../models/order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) { }

  createOrder(dto: CreateOrderDto): Observable<any> {
    return this.http.post(environment.orderUrl, dto);
  }

  getMyOrders(): Observable<any> {
    return this.http.get(`${environment.orderUrl}/my-orders`);
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get(`${environment.orderUrl}/${id}`);
  }

  createStripeSession(orderData: any): Observable<any> {
  return this.http.post(`${environment.orderUrl}/create-stripe-session`, orderData);
}

placeOrder(orderData: any): Observable<any> {
  return this.http.post(`${environment.orderUrl}`, orderData);
}

  cancelOrder(id: number, reason?: string): Observable<any> {
    const body: CancelOrderDto = reason ? { reason } : {};
    return this.http.post(`${environment.orderUrl}/${id}/cancel`, body);
  }

  // ✅ NEW: Mark as vendor seen
  markAsVendorSeen(id: number): Observable<any> {
    return this.http.post(`${environment.orderUrl}/${id}/vendor-seen`, {});
  }

  // ✅ NEW: Report delivery failure
  reportDeliveryFailure(dto: ReportDeliveryFailureDto): Observable<any> {
    return this.http.post(`${environment.orderUrl}/delivery-failure`, dto);
  }

  // ✅ NEW: Set customer delivery choice
  setCustomerChoice(dto: SetCustomerChoiceDto): Observable<any> {
    return this.http.post(`${environment.orderUrl}/delivery-failure/customer-choice`, dto);
  }

  // ✅ NEW: Get delivery failures
  getDeliveryFailures(orderId: number): Observable<any> {
    return this.http.get(`${environment.orderUrl}/${orderId}/delivery-failures`);
  }

  // ✅ NEW: Get failure reasons
  getFailureReasons(): Observable<any> {
    return this.http.get(`${environment.orderUrl}/failure-reasons`);
  }

  // ✅ NEW: Get delivery options
  getDeliveryOptions(): Observable<any> {
    return this.http.get(`${environment.orderUrl}/delivery-options`);
  }
}
