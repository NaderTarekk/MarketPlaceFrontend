// services/categories.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  ApiResponse, 
  Category, 
  CategoryFilterParams, 
  CreateCategoryDto, 
  PagedResponse, 
  UpdateCategoryDto 
} from '../../../models/category';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  
  constructor(private http: HttpClient) {}

  // ✅ Get all with filters
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

    // 🆕 Hierarchy filters
    if (filter.parentOnly) {
      params = params.set('parentOnly', 'true');
    }

    if (filter.childrenOnly) {
      params = params.set('childrenOnly', 'true');
    }

    if (filter.parentId !== undefined && filter.parentId !== null) {
      params = params.set('parentId', filter.parentId.toString());
    }

    if (filter.includeChildren) {
      params = params.set('includeChildren', 'true');
    }

    return this.http.get<PagedResponse<Category[]>>(environment.categoriesUrl, { params });
  }

  // 🆕 Get hierarchy (main categories with children) - for Catalog/Nav
  getHierarchy(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${environment.categoriesUrl}/hierarchy`);
  }

  // 🆕 Get parent categories only (for dropdowns)
  getParents(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${environment.categoriesUrl}/parents`);
  }

  // 🆕 Get children of specific parent
  getChildren(parentId: number): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${environment.categoriesUrl}/${parentId}/children`);
  }

  // Get by ID
  getById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${environment.categoriesUrl}/${id}`);
  }

  // Create
  create(dto: CreateCategoryDto): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(environment.categoriesUrl, dto);
  }

  // Update
  update(id: number, dto: UpdateCategoryDto): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${environment.categoriesUrl}/${id}`, dto);
  }

  // Delete
  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.categoriesUrl}/${id}`);
  }

  // Upload image
  uploadImage(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${environment.categoriesUrl}/upload-image`, formData);
  }
}