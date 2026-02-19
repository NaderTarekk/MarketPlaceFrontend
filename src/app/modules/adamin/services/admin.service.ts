// src/app/modules/admin/services/admin-reports.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import { AdminDashboard, AdminUser, ApiResponse, InventoryReport, PagedResponse, SalesReportFilter, SalesReportSummary, UserFilter } from '../../../models/adminDashboard';

@Injectable({
  providedIn: 'root'
})
export class AdminReportsService {

  constructor(private http: HttpClient) { }

  // Dashboard
  getDashboard(): Observable<ApiResponse<AdminDashboard>> {
    return this.http.get<ApiResponse<AdminDashboard>>(`${environment.adminUrl}/dashboard`);
  }

  // Users
  getUsers(filter: UserFilter): Observable<PagedResponse<AdminUser[]>> {
    let params = new HttpParams()
      .set('page', (filter.page || 1).toString())
      .set('pageSize', (filter.pageSize || 10).toString());

    if (filter.search) params = params.set('search', filter.search);
    if (filter.role) params = params.set('role', filter.role);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDesc !== undefined) params = params.set('sortDesc', filter.sortDesc.toString());

    return this.http.get<PagedResponse<AdminUser[]>>(`${environment.adminUrl}/users`, { params });
  }

  getUser(id: string): Observable<ApiResponse<AdminUser>> {
    return this.http.get<ApiResponse<AdminUser>>(`${environment.adminUrl}/users/${id}`);
  }

  updateUser(id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.adminUrl}/users/${id}`, data);
  }

  banUser(id: string, reason: string, reasonAr: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.adminUrl}/users/${id}/ban`, { reason, reasonAr });
  }

  unbanUser(id: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.adminUrl}/users/${id}/unban`, {});
  }

  deleteUser(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.adminUrl}/users/${id}`);
  }

  changeUserRole(id: string, role: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.adminUrl}/users/${id}/role`, { role });
  }

  getPendingVendorRequests(): Observable<any> {
    return this.http.get(`${environment.adminUrl}/pending-vendor-requests`);
  }

  // Approve Vendor Upgrade
  approveVendorUpgrade(userId: string): Observable<any> {
    return this.http.post(`${environment.adminUrl}/approve-vendor/${userId}`, {});
  }

  // Reject Vendor Upgrade
  rejectVendorUpgrade(userId: string): Observable<any> {
    return this.http.post(`${environment.adminUrl}/reject-vendor/${userId}`, {});
  }

  // Sales Report
  getSalesReport(filter: SalesReportFilter): Observable<ApiResponse<SalesReportSummary>> {
    let params = new HttpParams();
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    if (filter.groupBy) params = params.set('groupBy', filter.groupBy);
    if (filter.vendorId) params = params.set('vendorId', filter.vendorId);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());

    return this.http.get<ApiResponse<SalesReportSummary>>(`${environment.adminUrl}/sales`, { params });
  }

  // Inventory Report
  getInventoryReport(): Observable<ApiResponse<InventoryReport>> {
    return this.http.get<ApiResponse<InventoryReport>>(`${environment.adminUrl}/inventory`);
  }
}