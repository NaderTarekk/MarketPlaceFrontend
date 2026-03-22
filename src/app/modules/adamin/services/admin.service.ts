import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment';
import {
  AdminDashboard,
  AdminUser,
  ApiResponse,
  InventoryReport,
  PagedResponse,
  SalesReportFilter,
  SalesReportSummary,
  UserFilter
} from '../../../models/adminDashboard';
import {
  VendorList,
  VendorDetailedReport,
  DeliveryAgentList,
  DeliveryAgentReport,
  ShippingEmployeeList,
  ShippingEmployeeReport,
  FinancialReport,
  Settlement,
  CreateSettlement,
  UpdateCommissionRate,
  CreateVendorWithdrawal,
  VendorWithdrawalHistory,
  VendorWithdrawalSummary,
  VendorPrintReport,
  VendorReportFilter
} from '../../../models/financial-reports';

@Injectable({
  providedIn: 'root'
})
export class AdminReportsService {

  constructor(private http: HttpClient) { }

  // ═══════════════════════════════════════════════
  // EXISTING METHODS (Dashboard, Users, Sales, etc.)
  // ═══════════════════════════════════════════════

  getDashboard(): Observable<ApiResponse<AdminDashboard>> {
    return this.http.get<ApiResponse<AdminDashboard>>(`${environment.adminUrl}/dashboard`);
  }

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

  changeUserRole(id: string, payload: { role: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.adminUrl}/users/${id}/role`, payload);
  }

  getPendingVendorRequests(): Observable<any> {
    return this.http.get(`${environment.adminUrl}/pending-vendor-requests`);
  }

  approveVendorUpgrade(userId: string): Observable<any> {
    return this.http.post(`${environment.adminUrl}/approve-vendor/${userId}`, {});
  }

  rejectVendorUpgrade(userId: string): Observable<any> {
    return this.http.post(`${environment.adminUrl}/reject-vendor/${userId}`, {});
  }

  getSalesReport(filter: SalesReportFilter): Observable<ApiResponse<SalesReportSummary>> {
    let params = new HttpParams();
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    if (filter.groupBy) params = params.set('groupBy', filter.groupBy);
    if (filter.vendorId) params = params.set('vendorId', filter.vendorId);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());

    return this.http.get<ApiResponse<SalesReportSummary>>(`${environment.adminUrl}/sales`, { params });
  }

  getInventoryReport(): Observable<ApiResponse<InventoryReport>> {
    return this.http.get<ApiResponse<InventoryReport>>(`${environment.adminUrl}/inventory`);
  }

  // ═══════════════════════════════════════════════
  // ✅ NEW: VENDORS MANAGEMENT
  // ═══════════════════════════════════════════════

  getVendorsList(): Observable<ApiResponse<VendorList[]>> {
    return this.http.get<ApiResponse<VendorList[]>>(`${environment.adminUrl}/vendors`);
  }

  getVendorDetails(id: string): Observable<ApiResponse<VendorDetailedReport>> {
    return this.http.get<ApiResponse<VendorDetailedReport>>(`${environment.adminUrl}/vendors/${id}`);
  }

  updateVendorCommission(id: string, dto: UpdateCommissionRate): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.adminUrl}/vendors/${id}/commission`, dto);
  }

  // ═══════════════════════════════════════════════
  // ✅ NEW: DELIVERY AGENTS MANAGEMENT
  // ═══════════════════════════════════════════════

  getDeliveryAgentsList(): Observable<ApiResponse<DeliveryAgentList[]>> {
    return this.http.get<ApiResponse<DeliveryAgentList[]>>(`${environment.adminUrl}/delivery-agents`);
  }

  getDeliveryAgentDetails(id: string): Observable<ApiResponse<DeliveryAgentReport>> {
    return this.http.get<ApiResponse<DeliveryAgentReport>>(`${environment.adminUrl}/delivery-agents/${id}`);
  }

  markAgentCashCollected(vendorOrderId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${environment.adminUrl}/delivery-agents/cash-collected/${vendorOrderId}`,
      {}
    );
  }

  settleAgentCash(agentId: string, dto: CreateSettlement): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${environment.adminUrl}/delivery-agents/${agentId}/settle`,
      dto
    );
  }

  // ═══════════════════════════════════════════════
  // ✅ NEW: SHIPPING EMPLOYEES MANAGEMENT
  // ═══════════════════════════════════════════════

  getShippingEmployeesList(): Observable<ApiResponse<ShippingEmployeeList[]>> {
    return this.http.get<ApiResponse<ShippingEmployeeList[]>>(`${environment.adminUrl}/shipping-employees`);
  }

  getShippingEmployeeDetails(id: string): Observable<ApiResponse<ShippingEmployeeReport>> {
    return this.http.get<ApiResponse<ShippingEmployeeReport>>(`${environment.adminUrl}/shipping-employees/${id}`);
  }

  markShipmentCashCollected(shipmentId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${environment.adminUrl}/shipping-employees/cash-collected/${shipmentId}`,
      {}
    );
  }

  settleEmployeeCash(employeeId: string, dto: CreateSettlement): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${environment.adminUrl}/shipping-employees/${employeeId}/settle`,
      dto
    );
  }

  // ═══════════════════════════════════════════════
  // ✅ NEW: FINANCIAL REPORTS
  // ═══════════════════════════════════════════════

  getFinancialReport(): Observable<ApiResponse<FinancialReport>> {
    return this.http.get<ApiResponse<FinancialReport>>(`${environment.adminUrl}/financial-report`);
  }

  getSettlementHistory(userId?: string): Observable<ApiResponse<Settlement[]>> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    return this.http.get<ApiResponse<Settlement[]>>(`${environment.adminUrl}/settlements`, { params });
  }

  getVendorWithdrawalsSummary(): Observable<ApiResponse<VendorWithdrawalSummary[]>> {
    return this.http.get<ApiResponse<VendorWithdrawalSummary[]>>(
      `${environment.adminUrl}/vendor-withdrawals/summary`
    );
  }

  createVendorWithdrawal(dto: CreateVendorWithdrawal): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${environment.adminUrl}/vendor-withdrawals`,
      dto
    );
  }

  getVendorWithdrawalHistory(vendorId?: string): Observable<ApiResponse<VendorWithdrawalHistory[]>> {
    let params = new HttpParams();
    if (vendorId) params = params.set('vendorId', vendorId);

    return this.http.get<ApiResponse<VendorWithdrawalHistory[]>>(
      `${environment.adminUrl}/vendor-withdrawals/history`,
      { params }
    );
  }


  getVendorPrintReport(vendorId: string, filter: VendorReportFilter): Observable<ApiResponse<VendorPrintReport>> {
    let params = new HttpParams();
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    if (filter.status) params = params.set('status', filter.status);

    return this.http.get<ApiResponse<VendorPrintReport>>(
      `${environment.adminUrl}/vendors/${vendorId}/print-report`,
      { params }
    );
  }
}