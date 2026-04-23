import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  constructor(private http: HttpClient) {}

  getAll(activeOnly = true): Observable<any> {
    return this.http.get(`${environment.promotionUrl}?activeOnly=${activeOnly}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${environment.promotionUrl}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post(environment.promotionUrl, dto);
  }

  update(id: number, dto: any): Observable<any> {
    return this.http.put(`${environment.promotionUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${environment.promotionUrl}/${id}`);
  }

  addProduct(promotionId: number, productId: number): Observable<any> {
    return this.http.post(`${environment.promotionUrl}/${promotionId}/products/${productId}`, {});
  }

  removeProduct(promotionId: number, productId: number): Observable<any> {
    return this.http.delete(`${environment.promotionUrl}/${promotionId}/products/${productId}`);
  }
}
