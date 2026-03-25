import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { VendorReturn, ReturnStatus, ReturnStatusLabels } from '../../../../models/return';
import { ReturnService } from '../../../shipping/services/return-service';

@Component({
  selector: 'app-vendor-returns',
  standalone: false,
  templateUrl: './vendor-returns.component.html',
  styleUrl: './vendor-returns.component.css',
})
export class VendorReturnsComponent  implements OnInit {
  returns: VendorReturn[] = [];
  filteredReturns: VendorReturn[] = [];
  loading = false;
  selectedStatus: ReturnStatus | null = null;
  ReturnStatus = ReturnStatus;
  statusLabels = ReturnStatusLabels;
 
  statusFilters = [
    { value: null, label: 'الكل' },
    { value: ReturnStatus.Pending, label: 'في الانتظار' },
    { value: ReturnStatus.VendorApproved, label: 'تمت الموافقة' },
    { value: ReturnStatus.VendorRejected, label: 'مرفوض' }
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
    const status = this.selectedStatus !== null ? this.selectedStatus : undefined;
    
    this.returnService.getVendorReturns(status).subscribe({
      next: (res) => {
        if (res.success) {
          this.returns = res.data;
          this.filteredReturns = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.loading = false;
      }
    });
  }
 
  filterByStatus(status: ReturnStatus | null): void {
    this.selectedStatus = status;
    this.loadReturns();
  }
 
  getStatusClass(status: ReturnStatus): string {
    switch (status) {
      case ReturnStatus.Pending: return 'badge-warning';
      case ReturnStatus.VendorRejected:
      case ReturnStatus.AdminRejected: return 'badge-danger';
      case ReturnStatus.RefundCompleted: return 'badge-success';
      default: return 'badge-info';
    }
  }
 
  getPendingCount(): number {
    return this.returns.filter(r => r.status === ReturnStatus.Pending).length;
  }
}
