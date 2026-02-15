import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Category, CategoryFilterParams, CreateCategoryDto, PagedResponse, UpdateCategoryDto } from '../../../models/category';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  
  constructor(private http: HttpClient) {}

  getAll(filter: CategoryFilterParams): Observable<PagedResponse<Category[]>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.searchTerm) {
      params = params.set('searchTerm', filter.searchTerm);
    }

    if (filter.isActive !== null && filter.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString());
    }

    return this.http.get<PagedResponse<Category[]>>(environment.categoriesUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${environment.categoriesUrl}/${id}`);
  }

  create(dto: CreateCategoryDto): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(environment.categoriesUrl, dto);
  }

  update(id: number, dto: UpdateCategoryDto): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${environment.categoriesUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.categoriesUrl}/${id}`);
  }
}
