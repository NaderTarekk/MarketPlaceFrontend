import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse, PagedResponse, Product, ProductFilter, ProductList } from '../../../models/products';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Brand } from '../../../models/brand';
import { Category } from '../../../models/category';
import { WishlistItem } from '../../../models/wishlistItem';
import { ReviewFilter, ReviewResponse } from '../../../models/review';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private wishlistIds = new BehaviorSubject<number[]>([]);
  wishlistIds$ = this.wishlistIds.asObservable();

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('NHC_MP_Token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Products
  getAll(filter: ProductFilter): Observable<PagedResponse<ProductList[]>> {
    const params = this.buildParams(filter);
    return this.http.get<PagedResponse<ProductList[]>>(`${environment.productsUrl}?${params}`);
  }

  getById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${environment.productsUrl}/${id}`);
  }

  getFeatured(count: number = 8): Observable<ApiResponse<ProductList[]>> {
    return this.http.get<ApiResponse<ProductList[]>>(`${environment.productsUrl}/featured?count=${count}`);
  }

  getByCategory(categoryId: number, count: number = 8): Observable<ApiResponse<ProductList[]>> {
    return this.http.get<ApiResponse<ProductList[]>>(`${environment.productsUrl}/category/${categoryId}?count=${count}`);
  }

  getRelated(productId: number, count: number = 4): Observable<ApiResponse<ProductList[]>> {
    return this.http.get<ApiResponse<ProductList[]>>(`${environment.productsUrl}/${productId}/related?count=${count}`);
  }

  create(data: any): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(environment.productsUrl, data, { headers: this.getHeaders() });
  }

  update(id: number, data: any): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${environment.productsUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.productsUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateStatus(id: number, data: { status: number }): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(
      `${environment.productsUrl}/${id}/status`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // Categories
  getCategories(isActive?: boolean): Observable<ApiResponse<Category[]>> {
    const params = isActive !== undefined ? `?isActive=${isActive}` : '';
    return this.http.get<ApiResponse<Category[]>>(`${environment.categoriesUrl}${params}`);
  }

  // Brands
  getBrands(isActive?: boolean): Observable<ApiResponse<Brand[]>> {
    const params = isActive !== undefined ? `?isActive=${isActive}` : '';
    return this.http.get<ApiResponse<Brand[]>>(`${environment.brandsUrl}${params}`);
  }

  private buildParams(filter: ProductFilter): string {
    const params: string[] = [];
    if (filter.search) params.push(`search=${encodeURIComponent(filter.search)}`);
    if (filter.categoryId) params.push(`categoryId=${filter.categoryId}`);
    if (filter.brandId) params.push(`brandId=${filter.brandId}`);
    if (filter.minPrice !== undefined) params.push(`minPrice=${filter.minPrice}`);
    if (filter.maxPrice !== undefined) params.push(`maxPrice=${filter.maxPrice}`);
    if (filter.inStock !== undefined) params.push(`inStock=${filter.inStock}`);
    if (filter.isFeatured !== undefined) params.push(`isFeatured=${filter.isFeatured}`);
    if (filter.sortBy) params.push(`sortBy=${filter.sortBy}`);
    if (filter.sortDesc !== undefined) params.push(`sortDesc=${filter.sortDesc}`);
    if (filter.page) params.push(`page=${filter.page}`);
    if (filter.pageSize) params.push(`pageSize=${filter.pageSize}`);
    return params.join('&');
  }

  uploadImage(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(
      `${environment.productsUrl}/upload-image`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  // Wishlist functions
  getWishlist(): Observable<ApiResponse<WishlistItem[]>> {
    return this.http.get<ApiResponse<WishlistItem[]>>(environment.wishlistsUrl, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.success) {
          this.wishlistIds.next(res.data.map(item => item.productId));
        }
      })
    );
  }

  addItem(productId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.wishlistsUrl}/${productId}`, {}, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.success) {
          const current = this.wishlistIds.value;
          if (!current.includes(productId)) {
            this.wishlistIds.next([...current, productId]);
          }
        }
      })
    );
  }

  removeItem(productId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.wishlistsUrl}/${productId}`, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.success) {
          this.wishlistIds.next(this.wishlistIds.value.filter(id => id !== productId));
        }
      })
    );
  }

  toggle(productId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.wishlistsUrl}/${productId}/toggle`, {}, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.success) {
          const current = this.wishlistIds.value;
          if (current.includes(productId)) {
            this.wishlistIds.next(current.filter(id => id !== productId));
          } else {
            this.wishlistIds.next([...current, productId]);
          }
        }
      })
    );
  }

  isInWishlist(productId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${environment.wishlistsUrl}/${productId}/check`, { headers: this.getHeaders() });
  }

  getProductReviews(productId: number): Observable<ApiResponse<ReviewResponse[]>> {
    return this.http.get<ApiResponse<ReviewResponse[]>>(`${environment.reviewsUrl}/product/${productId}`);
  }

  createReview(data: { productId: number; rating: number; comment: string }): Observable<ApiResponse<ReviewResponse>> {
    return this.http.post<ApiResponse<ReviewResponse>>(`${environment.reviewsUrl}`, data, { headers: this.getHeaders() });
  }

  getAllReviews(filter: ReviewFilter): Observable<PagedResponse<ReviewResponse[]>> {

    const params = this.buildReviewParams(filter);

    const url = `${environment.reviewsUrl}?${params}`;

    return this.http.get<PagedResponse<ReviewResponse[]>>(url, { headers: this.getHeaders() });
  }

  private buildReviewParams(filter: ReviewFilter): string {

    const params: string[] = [];

    if (filter.productId) params.push(`ProductId=${filter.productId}`); // ⬅️ لاحظ الـ Capital P
    if (filter.isApproved !== undefined) params.push(`IsApproved=${filter.isApproved}`); // ⬅️ Capital I
    if (filter.rating) params.push(`Rating=${filter.rating}`); // ⬅️ Capital R
    if (filter.searchTerm) params.push(`SearchTerm=${encodeURIComponent(filter.searchTerm)}`); // ⬅️ Capital S & T
    if (filter.pageNumber) params.push(`PageNumber=${filter.pageNumber}`); // ⬅️ Capital P & N
    if (filter.pageSize) params.push(`PageSize=${filter.pageSize}`); // ⬅️ Capital P & S

    return params.join('&');
  }

  approveReview(id: number): Observable<ApiResponse<ReviewResponse>> {
    return this.http.patch<ApiResponse<ReviewResponse>>(
      `${environment.reviewsUrl}/${id}/approve`,
      {},
      { headers: this.getHeaders() }
    );
  }

  rejectReview(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${environment.reviewsUrl}/${id}/reject`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getMyReviews(): Observable<ApiResponse<ReviewResponse[]>> {
    return this.http.get<ApiResponse<ReviewResponse[]>>(`${environment.reviewsUrl}/my-reviews`);
  }

  updateReview(id: number, data: { rating?: number; comment?: string }): Observable<ApiResponse<ReviewResponse>> {
    return this.http.put<ApiResponse<ReviewResponse>>(`${environment.reviewsUrl}/${id}`, data);
  }

  deleteReview(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.reviewsUrl}/${id}`);
  }
}
