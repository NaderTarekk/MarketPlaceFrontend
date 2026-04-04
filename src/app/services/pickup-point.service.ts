import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({ providedIn: 'root' })
export class PickupPointService {
  constructor(private http: HttpClient) {}

  getAll(governorateId?: number): Observable<any> {
    const params = governorateId ? `?governorateId=${governorateId}` : '';
    return this.http.get(`${environment.pickupPointUrl}${params}`);
  }

  getByGovernorate(governorateId: number): Observable<any> {
    return this.http.get(`${environment.pickupPointUrl}/by-governorate/${governorateId}`);
  }

  getGovernoratesWithPoints(): Observable<any> {
    return this.http.get(`${environment.pickupPointUrl}/governorates-with-points`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${environment.pickupPointUrl}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post(environment.pickupPointUrl, dto);
  }

  update(id: number, dto: any): Observable<any> {
    return this.http.put(`${environment.pickupPointUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${environment.pickupPointUrl}/${id}`);
  }
}
