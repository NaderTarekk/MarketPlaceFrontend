import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({ providedIn: 'root' })
export class WithdrawalService {
  constructor(private http: HttpClient) {}

  // Vendor
  getMyRequests(): Observable<any> {
    return this.http.get(`${environment.withdrawalUrl}/my-requests`);
  }

  getMyBalance(): Observable<any> {
    return this.http.get(`${environment.withdrawalUrl}/my-balance`);
  }

  createRequest(dto: any): Observable<any> {
    return this.http.post(`${environment.withdrawalUrl}/request`, dto);
  }

  // Admin
  getAll(status?: number): Observable<any> {
    const params = status !== undefined ? `?status=${status}` : '';
    return this.http.get(`${environment.withdrawalUrl}/all${params}`);
  }

  approve(id: number, dto: any = {}): Observable<any> {
    return this.http.post(`${environment.withdrawalUrl}/${id}/approve`, dto);
  }

  reject(id: number, dto: any): Observable<any> {
    return this.http.post(`${environment.withdrawalUrl}/${id}/reject`, dto);
  }
}
