import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../models/products';
import { CartResponse } from '../../../models/cart';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment';
import { CreatePromoCode, PromoCode, PromoCodeValidation } from '../../../models/promo-code';

@Injectable({
  providedIn: 'root',
})
export class CartService {
    private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<ApiResponse<CartResponse>> {
    return this.http.get<ApiResponse<CartResponse>>(environment.cartUrl).pipe(
      tap(res => {
        if (res.success) {
          this.cartCountSubject.next(res.data.items.length);
        }
      })
    );
  }

  addItem(productId: number, quantity: number = 1): Observable<ApiResponse<CartResponse>> {
    return this.http.post<ApiResponse<CartResponse>>(environment.cartUrl, { productId, quantity }).pipe(
      tap(res => {
        if (res.success) {
          this.cartCountSubject.next(res.data.items.length);
        }
      })
    );
  }

  updateQuantity(productId: number, quantity: number): Observable<ApiResponse<CartResponse>> {
    return this.http.put<ApiResponse<CartResponse>>(`${environment.cartUrl}/${productId}`, quantity);
  }

  removeItem(productId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.cartUrl}/${productId}`).pipe(
      tap(res => {
        if (res.success) {
          const currentCount = this.cartCountSubject.value;
          this.cartCountSubject.next(Math.max(0, currentCount - 1));
        }
      })
    );
  }

  clearCart(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(environment.cartUrl).pipe(
      tap(res => {
        if (res.success) {
          this.cartCountSubject.next(0);
        }
      })
    );
  }

  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  // promocode related methods for admin
  // Admin
  getAll(): Observable<ApiResponse<PromoCode[]>> {
    return this.http.get<ApiResponse<PromoCode[]>>(environment.promoCodeUrl);
  }

  create(data: CreatePromoCode): Observable<ApiResponse<PromoCode>> {
    return this.http.post<ApiResponse<PromoCode>>(environment.promoCodeUrl, data);
  }

  update(id: number, data: any): Observable<ApiResponse<PromoCode>> {
    return this.http.put<ApiResponse<PromoCode>>(`${environment.promoCodeUrl}/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.promoCodeUrl}/${id}`);
  }

  // Public
  validate(code: string, orderAmount: number): Observable<ApiResponse<PromoCodeValidation>> {
    return this.http.post<ApiResponse<PromoCodeValidation>>(`${environment.promoCodeUrl}/validate`, {
      code,
      orderAmount
    });
  }
}
