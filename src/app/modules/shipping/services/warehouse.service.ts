// src/app/services/warehouse.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environment';
import { ApiResponse } from './shipping.service';
import { Shelf, WarehouseOrder, CustomerOrders, CreateShelf, PickupOrder, SearchWarehouse, StoreOrderInShelf } from '../../../models/warehouse';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private apiUrl = `${environment.baseApi}/api/warehouse`;

  constructor(private http: HttpClient) { }

  // ===== SHELVES =====
  getAllShelves(): Observable<ApiResponse<Shelf[]>> {
    return this.http.get<ApiResponse<Shelf[]>>(`${this.apiUrl}/shelves`);
  }

  getShelfById(id: number): Observable<ApiResponse<Shelf>> {
    return this.http.get<ApiResponse<Shelf>>(`${this.apiUrl}/shelves/${id}`);
  }

  createShelf(dto: CreateShelf): Observable<ApiResponse<Shelf>> {
    return this.http.post<ApiResponse<Shelf>>(`${this.apiUrl}/shelves`, dto);
  }

  deleteShelf(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/shelves/${id}`);
  }

  // ===== WAREHOUSE ORDERS =====
  getWarehouseOrders(): Observable<ApiResponse<WarehouseOrder[]>> {
    return this.http.get<ApiResponse<WarehouseOrder[]>>(`${this.apiUrl}/orders`);
  }

  getWarehouseOrderByQR(qrCode: string): Observable<ApiResponse<WarehouseOrder>> {
    return this.http.get<ApiResponse<WarehouseOrder>>(`${this.apiUrl}/orders/qr/${qrCode}`);
  }

  storeOrderInShelf(dto: StoreOrderInShelf): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/orders/store`, dto);
  }

  markAsPickedUp(dto: PickupOrder): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/orders/pickup`, dto);
  }

  // ===== CUSTOMER ORDERS =====
  getCustomerOrdersByQR(customerQRCode: string): Observable<ApiResponse<CustomerOrders>> {
    return this.http.get<ApiResponse<CustomerOrders>>(`${this.apiUrl}/customer/${customerQRCode}`);
  }

  // ===== SEARCH =====
  searchWarehouse(dto: SearchWarehouse): Observable<ApiResponse<WarehouseOrder[]>> {
    return this.http.post<ApiResponse<WarehouseOrder[]>>(`${this.apiUrl}/search`, dto);
  }
}