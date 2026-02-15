import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient } from '@angular/common/http';
import { CreateOrderDto } from '../../../models/order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  createOrder(dto: CreateOrderDto): Observable<any> {
    return this.http.post(environment.orderUrl, dto);
  }

  getMyOrders(): Observable<any> {
    return this.http.get(`${environment.orderUrl}/my-orders`);
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get(`${environment.orderUrl}/${id}`);
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.post(`${environment.orderUrl}/${id}/cancel`, {});
  }
}
