import { Injectable } from '@angular/core';
import { Category, PagedResponse } from '../../../models/category';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  constructor(private http: HttpClient) { }

  getCategories(isActive: boolean = true): Observable<PagedResponse<Category[]>> {
    return this.http.get<PagedResponse<Category[]>>(
      `${environment.categoriesUrl}?IsActive=${isActive}&PageSize=50`
    );
  }
}
