import { Injectable } from '@angular/core';
import { CategoryResponse } from '../../../models/category';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  constructor(private http: HttpClient) { }

  getCategories(isActive: boolean = true): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${environment.categoriesUrl}?IsActive=${isActive}&PageSize=50`);
  }
}
