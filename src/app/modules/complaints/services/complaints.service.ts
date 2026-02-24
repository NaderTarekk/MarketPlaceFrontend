import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComplaintsService {

  constructor(private http: HttpClient) { }

  // Customer APIs
  createComplaint(data: any): Observable<any> {
    return this.http.post(`${environment.complaintUrl}`, data);
  }

  getMyComplaints(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.complaintUrl}/my-complaints`);
  }

  // Admin APIs
  getAllComplaints(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.complaintUrl}`);
  }

  getComplaintById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.complaintUrl}/${id}`);
  }

  updateComplaintStatus(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.complaintUrl}/${id}/status`, data);
  }

  deleteComplaint(id: number): Observable<any> {
    return this.http.delete(`${environment.complaintUrl}/${id}`);
  }

  // Brand Blocking APIs
  blockBrand(data: any): Observable<any> {
    return this.http.post(`${environment.complaintUrl}/block-brand`, data);
  }

  unblockBrand(brandId: number): Observable<any> {
    return this.http.post(`${environment.complaintUrl}/unblock-brand/${brandId}`, {});
  }

  getBlockedBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.complaintUrl}/blocked-brands`);
  }

  isBrandBlocked(brandId: number): Observable<any> {
    return this.http.get<any>(`${environment.complaintUrl}/is-brand-blocked/${brandId}`);
  }

}
