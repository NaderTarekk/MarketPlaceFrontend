import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import {
  ShipmentListItem,
  ShipmentDetails,
  VendorOrder,
  DeliveryAgent,
  DeliveryAgentTask,
  VendorPendingOrder,
  AssignDeliveryAgentDto,
  BulkAssignDto,
  ShipmentFilter,
  VendorOrderFilter,
  ShipmentStatus
} from '../../../models/shipping';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PagedResponse<T> {
  success: boolean;
  data: T;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private baseUrl = environment.shippingUrl;

  constructor(private http: HttpClient) { }

  // ==================== Shipments ====================

  getAllShipments(filter?: ShipmentFilter): Observable<PagedResponse<ShipmentListItem[]>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.status !== undefined) params = params.set('status', filter.status.toString());
      if (filter.customerId) params = params.set('customerId', filter.customerId);
      if (filter.fromDate) params = params.set('fromDate', filter.fromDate.toISOString());
      if (filter.toDate) params = params.set('toDate', filter.toDate.toISOString());
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }
    return this.http.get<PagedResponse<ShipmentListItem[]>>(`${this.baseUrl}/shipments`, { params });
  }

  updateVendorOrderStatus(vendorOrderId: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/shipments/vendor-orders/${vendorOrderId}/status`, { status });
  }

  getShipmentById(id: number): Observable<ApiResponse<ShipmentDetails>> {
    return this.http.get<ApiResponse<ShipmentDetails>>(`${this.baseUrl}/shipments/${id}`);
  }

  getShipmentByBarcode(barcode: string): Observable<ApiResponse<ShipmentDetails>> {
    return this.http.get<ApiResponse<ShipmentDetails>>(`${this.baseUrl}/shipments/barcode/${barcode}`);
  }

  updateShipmentStatus(id: number, status: ShipmentStatus): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/shipments/${id}/status`, status);
  }

  markReadyForPickup(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/shipments/${id}/ready-for-pickup`, {});
  }

  markShipmentDelivered(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/shipments/${id}/delivered`, {});
  }

  // ==================== VendorOrders ====================

  getAllVendorOrders(filter?: VendorOrderFilter): Observable<PagedResponse<VendorOrder[]>> {
    let params = new HttpParams();
    if (filter) {
      if (filter.status !== undefined) params = params.set('status', filter.status.toString());
      if (filter.vendorId) params = params.set('vendorId', filter.vendorId);
      if (filter.deliveryAgentId) params = params.set('deliveryAgentId', filter.deliveryAgentId);
      if (filter.deliveryType !== undefined) params = params.set('deliveryType', filter.deliveryType.toString());
      if (filter.fromDate) params = params.set('fromDate', filter.fromDate.toISOString());
      if (filter.toDate) params = params.set('toDate', filter.toDate.toISOString());
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }
    return this.http.get<PagedResponse<VendorOrder[]>>(`${this.baseUrl}/vendor-orders`, { params });
  }

  getPendingVendorOrders(): Observable<ApiResponse<VendorOrder[]>> {
    return this.http.get<ApiResponse<VendorOrder[]>>(`${this.baseUrl}/vendor-orders/pending`);
  }

  getVendorOrderById(id: number): Observable<ApiResponse<VendorOrder>> {
    return this.http.get<ApiResponse<VendorOrder>>(`${this.baseUrl}/vendor-orders/${id}`);
  }

  getVendorOrderByBarcode(barcode: string): Observable<ApiResponse<VendorOrder>> {
    return this.http.get<ApiResponse<VendorOrder>>(`${this.baseUrl}/vendor-orders/barcode/${barcode}`);
  }

  // ==================== Shipping Employee ====================

  assignDeliveryAgent(dto: AssignDeliveryAgentDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/assign-agent`, dto);
  }

  bulkAssignDeliveryAgent(dto: BulkAssignDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/bulk-assign`, dto);
  }

  getAvailableDeliveryAgents(): Observable<ApiResponse<DeliveryAgent[]>> {
    return this.http.get<ApiResponse<DeliveryAgent[]>>(`${this.baseUrl}/delivery-agents`);
  }

  // ==================== Delivery Agent ====================

  getAgentTasks(): Observable<ApiResponse<DeliveryAgentTask[]>> {
    return this.http.get<ApiResponse<DeliveryAgentTask[]>>(`${this.baseUrl}/agent/tasks`);
  }

  pickFromVendor(vendorOrderId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/agent/pick/${vendorOrderId}`, {});
  }

  deliverToWarehouse(vendorOrderId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/agent/deliver-warehouse/${vendorOrderId}`, {});
  }

  deliverToCustomer(vendorOrderId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/agent/deliver-customer/${vendorOrderId}`, {});
  }

  // ==================== Vendor ====================

  getVendorPendingOrders(): Observable<ApiResponse<VendorPendingOrder[]>> {
    return this.http.get<ApiResponse<VendorPendingOrder[]>>(`${this.baseUrl}/vendor/orders`);
  }

  confirmHandoverToAgent(vendorOrderId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/vendor/confirm-handover/${vendorOrderId}`, {});
  }

  // ==================== Barcode Scanner ====================

  scanBarcode(barcode: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/scan/${barcode}`);
  }

  reportDeliveryFailure(dto: { orderId: number; reason: number; otherReason?: string }): Observable<any> {
    return this.http.post(`${environment.orderUrl}/delivery-failure`, dto);
  }

  setCustomerChoice(dto: { failureId: number; customerChoice: number; customerNotes?: string }): Observable<any> {
    return this.http.post(`${environment.orderUrl}/delivery-failure/customer-choice`, dto);
  }

  getDeliveryFailures(orderId: number): Observable<any> {
    return this.http.get(`${environment.orderUrl}/${orderId}/delivery-failures`);
  }

  getUnresolvedFailures(): Observable<ApiResponse<any[]>> {
  return this.http.get<ApiResponse<any[]>>(`${environment.orderUrl}/delivery-failures/unresolved`);
}

  getMyOrdersSummary(): Observable<any> {
  return this.http.get(`${environment.shippingUrl}/agent/my-summary`);
}
}