import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReturnRequestList, ReturnStatus, ReturnStatusLabels } from '../../../../models/return';
import { ReturnService } from '../../../shipping/services/return-service';

@Component({
  selector: 'app-my-return',
  standalone: false,
  templateUrl: './my-return.component.html',
  styleUrl: './my-return.component.css',
})
export class MyReturnComponent implements OnInit {
  returns: ReturnRequestList[] = [];
  loading = false;
  ReturnStatus = ReturnStatus;
  statusLabels = ReturnStatusLabels;

  constructor(
    private returnService: ReturnService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns(): void {
    this.loading = true;
    this.returnService.getMyReturns().subscribe({
      next: (res) => {
        if (res.success) {
          this.returns = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ في تحميل البيانات');
        this.loading = false;
      }
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/returns', id]);
  }

  cancelReturn(id: number): void {
    if (confirm('هل أنت متأكد من إلغاء طلب الإرجاع؟')) {
      this.returnService.cancelReturn(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('تم إلغاء طلب الإرجاع');
            this.loadReturns();
          } else {
            this.toastr.error(res.message);
          }
        },
        error: () => this.toastr.error('حدث خطأ')
      });
    }
  }

  getStatusClass(status: ReturnStatus): string {
    switch (status) {
      case ReturnStatus.Pending:
      case ReturnStatus.VendorApproved:
        return 'badge-warning';
      case ReturnStatus.VendorRejected:
      case ReturnStatus.AdminRejected:
      case ReturnStatus.InspectionFailed:
      case ReturnStatus.Cancelled:
        return 'badge-danger';
      case ReturnStatus.RefundCompleted:
        return 'badge-success';
      default:
        return 'badge-info';
    }
  }
}
