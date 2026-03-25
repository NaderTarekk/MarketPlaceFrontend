// ============================================================================
// 📁 services/return.service.ts
// ============================================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environment';
import { CreateReturnRequest, ReturnRequestDetails, ReturnRequestList, RefundMethod, ReturnStatus, VendorReturn, VendorReturnResponse, ReturnStatistics, ReturnFilter, AdminReturnResponse, AssignReturnAgent, ReturnInspection, ProcessRefund, ReturnPickupTask } from '../../../models/return';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PagedResponse<T> {
    success: boolean;
    message: string;
    data: T;
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReturnService {
    private baseUrl = `${environment.baseApi}/api/returns`;

    constructor(private http: HttpClient) { }

    // ==================== Customer ====================

    createReturnRequest(dto: CreateReturnRequest): Observable<ApiResponse<ReturnRequestDetails>> {
        return this.http.post<ApiResponse<ReturnRequestDetails>>(this.baseUrl, dto);
    }

    getMyReturns(): Observable<ApiResponse<ReturnRequestList[]>> {
        return this.http.get<ApiResponse<ReturnRequestList[]>>(`${this.baseUrl}/my-returns`);
    }

    getReturnDetails(id: number): Observable<ApiResponse<ReturnRequestDetails>> {
        return this.http.get<ApiResponse<ReturnRequestDetails>>(`${this.baseUrl}/${id}`);
    }

    cancelReturn(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
    }

    selectRefundMethod(id: number, method: RefundMethod): Observable<ApiResponse<any>> {
        return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/refund-method`, method);
    }

    canOrderBeReturned(orderId: number): Observable<ApiResponse<boolean>> {
        return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/can-return/${orderId}`);
    }

    // ==================== Vendor ====================

    getVendorReturns(status?: ReturnStatus): Observable<ApiResponse<VendorReturn[]>> {
        let params = new HttpParams();
        if (status !== undefined) {
            params = params.set('status', status.toString());
        }
        return this.http.get<ApiResponse<VendorReturn[]>>(`${this.baseUrl}/vendor`, { params });
    }

    vendorRespond(dto: VendorReturnResponse): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.baseUrl}/vendor/respond`, dto);
    }

    getVendorStatistics(): Observable<ApiResponse<ReturnStatistics>> {
        return this.http.get<ApiResponse<ReturnStatistics>>(`${this.baseUrl}/vendor/statistics`);
    }

    // ==================== Admin ====================

    getAllReturns(filter: ReturnFilter): Observable<PagedResponse<ReturnRequestList[]>> {
        let params = new HttpParams()
            .set('page', filter.page.toString())
            .set('pageSize', filter.pageSize.toString());

        if (filter.status !== undefined) params = params.set('status', filter.status.toString());
        if (filter.customerId) params = params.set('customerId', filter.customerId);
        if (filter.vendorId) params = params.set('vendorId', filter.vendorId);
        if (filter.reason !== undefined) params = params.set('reason', filter.reason.toString());
        if (filter.fromDate) params = params.set('fromDate', filter.fromDate.toISOString());
        if (filter.toDate) params = params.set('toDate', filter.toDate.toISOString());

        return this.http.get<PagedResponse<ReturnRequestList[]>>(`${this.baseUrl}/admin`, { params });
    }

    adminRespond(dto: AdminReturnResponse): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.baseUrl}/admin/respond`, dto);
    }

    assignAgent(dto: AssignReturnAgent): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.baseUrl}/admin/assign-agent`, dto);
    }

    markReceived(id: number): Observable<ApiResponse<any>> {
        return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/admin/${id}/received`, {});
    }

    recordInspection(dto: ReturnInspection): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.baseUrl}/admin/inspection`, dto);
    }

    processRefund(dto: ProcessRefund): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.baseUrl}/admin/refund`, dto);
    }

    getStatistics(fromDate?: Date, toDate?: Date): Observable<ApiResponse<ReturnStatistics>> {
        let params = new HttpParams();
        if (fromDate) params = params.set('fromDate', fromDate.toISOString());
        if (toDate) params = params.set('toDate', toDate.toISOString());
        return this.http.get<ApiResponse<ReturnStatistics>>(`${this.baseUrl}/admin/statistics`, { params });
    }

    // ==================== Delivery Agent ====================

    getAgentTasks(): Observable<ApiResponse<ReturnPickupTask[]>> {
        return this.http.get<ApiResponse<ReturnPickupTask[]>>(`${this.baseUrl}/agent/tasks`);
    }

    confirmPickup(id: number): Observable<ApiResponse<any>> {
        return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/agent/${id}/pickup`, {});
    }

    deliverToWarehouse(id: number): Observable<ApiResponse<any>> {
        return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/agent/${id}/deliver-warehouse`, {});
    }
}