import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ReturnRequestList, ReturnFilter, ReturnStatus, ReturnReason, ReturnStatusLabels, ReturnReasonLabels } from '../../../../models/return';
import { ReturnService } from '../../../shipping/services/return-service';

@Component({
  selector: 'app-admin-returns',
  standalone: false,
  templateUrl: './admin-returns.component.html',
  styleUrl: './admin-returns.component.css',
})
export class AdminReturnsComponent implements OnInit {
  returns: ReturnRequestList[] = [];
  loading = false;
  totalCount = 0;
  totalPages = 0;
  
  filter: ReturnFilter = {
    page: 1,
    pageSize: 10
  };
 
  ReturnStatus = ReturnStatus;
  ReturnReason = ReturnReason;
  statusLabels = ReturnStatusLabels;
  reasonLabels = ReturnReasonLabels;
 
  statusOptions = [
    { value: undefined, label: 'الكل' },
    { value: ReturnStatus.Pending, label: 'في انتظار التاجر' },
    { value: ReturnStatus.VendorApproved, label: 'في انتظار الإدارة' },
    { value: ReturnStatus.AdminApproved, label: 'تمت الموافقة' },
    { value: ReturnStatus.PickupScheduled, label: 'جاري الاستلام' },
    { value: ReturnStatus.InWarehouse, label: 'في المخزن' },
    { value: ReturnStatus.RefundCompleted, label: 'مكتمل' }
  ];
 
  constructor(
    private returnService: ReturnService,
    private toastr: ToastrService
  ) {}
 
  ngOnInit(): void {
    this.loadReturns();
  }
 
  loadReturns(): void {
    this.loading = true;
    this.returnService.getAllReturns(this.filter).subscribe({
      next: (res) => {
        if (res.success) {
          this.returns = res.data;
          this.totalCount = res.totalCount;
          this.totalPages = res.totalPages;
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.loading = false;
      }
    });
  }
 
  onFilterChange(): void {
    this.filter.page = 1;
    this.loadReturns();
  }
 
  onPageChange(page: number): void {
    this.filter.page = page;
    this.loadReturns();
  }
 
  getStatusClass(status: ReturnStatus): string {
    switch (status) {
      case ReturnStatus.Pending:
      case ReturnStatus.VendorApproved:
        return 'badge-warning';
      case ReturnStatus.VendorRejected:
      case ReturnStatus.AdminRejected:
      case ReturnStatus.InspectionFailed:
        return 'badge-danger';
      case ReturnStatus.RefundCompleted:
        return 'badge-success';
      default:
        return 'badge-info';
    }
  }
 
  getActionNeeded(item: ReturnRequestList): string {
    if (item.needsAdminAction) return 'يحتاج موافقتك';
    if (item.needsVendorAction) return 'في انتظار التاجر';
    return '';
  }
}
