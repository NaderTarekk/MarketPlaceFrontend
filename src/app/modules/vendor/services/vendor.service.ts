import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SalesReport, VendorDashboard } from '../../../models/vendor';
import { ApiResponse, PagedResponse, ProductFilter, ProductList } from '../../../models/products';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<VendorDashboard>> {
    return this.http.get<ApiResponse<VendorDashboard>>(`${environment.vendorUrl}/dashboard`);  // ✅ أضف /dashboard
  }

  getProducts(filter: ProductFilter): Observable<PagedResponse<ProductList[]>> {
    let params = new HttpParams()
      .set('page', filter.page?.toString() || '1')
      .set('pageSize', filter.pageSize?.toString() || '10');

    if (filter.search) params = params.set('search', filter.search);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
    if (filter.status !== undefined) params = params.set('status', filter.status.toString());
    if (filter.inStock !== undefined) params = params.set('inStock', filter.inStock.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDesc !== undefined) params = params.set('sortDesc', filter.sortDesc.toString());

    return this.http.get<PagedResponse<ProductList[]>>(`${environment.vendorUrl}/products`, { params });  // ✅
  }

  getSalesReport(from?: Date, to?: Date): Observable<ApiResponse<SalesReport[]>> {
    let params = new HttpParams();
    if (from) params = params.set('from', from.toISOString());
    if (to) params = params.set('to', to.toISOString());

    return this.http.get<ApiResponse<SalesReport[]>>(`${environment.vendorUrl}/sales-report`, { params });  // ✅
  }

  createProduct(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.vendorUrl}/products`, data);  // ✅
  }

  updateProduct(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.vendorUrl}/products/${id}`, data);  // ✅
  }

  deleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.vendorUrl}/products/${id}`);  // ✅
  }

  uploadImage(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${environment.vendorUrl}/upload-image`, formData);  // ✅
  }
}