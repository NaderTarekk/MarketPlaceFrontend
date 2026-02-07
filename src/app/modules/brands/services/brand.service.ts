import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse, Brand } from '../../../models/brand';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(isActive?: boolean): Observable<ApiResponse<Brand[]>> {
    const params = isActive !== undefined ? `?isActive=${isActive}` : '';
    return this.http.get<ApiResponse<Brand[]>>(`${environment.brandsUrl}${params}`);
  }

  getById(id: number): Observable<ApiResponse<Brand>> {
    return this.http.get<ApiResponse<Brand>>(`${environment.brandsUrl}/${id}`);
  }

  create(formData: FormData): Observable<ApiResponse<Brand>> {
    return this.http.post<ApiResponse<Brand>>(environment.brandsUrl, formData, { headers: this.getHeaders() });
  }

  update(id: number, formData: FormData): Observable<ApiResponse<Brand>> {
    return this.http.put<ApiResponse<Brand>>(`${environment.brandsUrl}/${id}`, formData, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.brandsUrl}/${id}`, { headers: this.getHeaders() });
  }
}