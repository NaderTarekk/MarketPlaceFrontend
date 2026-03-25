// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  📁 cart/components/return-details/return-details.component.ts            ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReturnService } from '../../../shipping/services/return-service';
import { ReturnStatus } from '../../../../models/return';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-return-details',
  standalone: false,
  templateUrl: './return-details.component.html',
  styleUrls: ['./return-details.component.css']
})
export class ReturnDetailsComponent implements OnInit {
  returnId!: number;
  returnRequest: any;
  loading = false;
  ReturnStatus = ReturnStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private returnService: ReturnService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.returnId = +this.route.snapshot.params['id'];
    this.loadReturn();
  }

  loadReturn(): void {
    this.loading = true;
    this.returnService.getReturnDetails(this.returnId).subscribe({
      next: (res: any) => {
        this.returnRequest = res.data || res;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ في تحميل البيانات');
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: ReturnStatus): string {
    const labels: Record<number, string> = {
      [ReturnStatus.Pending]: 'في الانتظار',
      [ReturnStatus.VendorApproved]: 'موافقة التاجر',
      [ReturnStatus.VendorRejected]: 'رفض التاجر',
      [ReturnStatus.AdminApproved]: 'موافقة الإدارة',
      [ReturnStatus.AdminRejected]: 'رفض الإدارة',
      [ReturnStatus.PickupScheduled]: 'تم جدولة الاستلام',
      [ReturnStatus.PickedUp]: 'تم الاستلام',
      [ReturnStatus.InWarehouse]: 'في المخزن',
      [ReturnStatus.InspectionPassed]: 'اجتاز الفحص',
      [ReturnStatus.InspectionFailed]: 'فشل الفحص',
      [ReturnStatus.RefundProcessing]: 'جاري الاسترداد',
      [ReturnStatus.RefundCompleted]: 'تم الاسترداد',
      [ReturnStatus.Cancelled]: 'ملغي'
    };
    return labels[status] || 'غير معروف';
  }

  getStatusClass(status: ReturnStatus): string {
    if (status === ReturnStatus.RefundCompleted) return 'bg-success';
    if (status === ReturnStatus.VendorRejected || status === ReturnStatus.AdminRejected) return 'bg-danger';
    if (status === ReturnStatus.Cancelled) return 'bg-secondary';
    return 'bg-warning';
  }

  cancelReturn(): void {
    if (!confirm('هل أنت متأكد من إلغاء طلب الإرجاع؟')) return;
    
    this.returnService.cancelReturn(this.returnId).subscribe({
      next: () => {
        this.toastr.success('تم إلغاء طلب الإرجاع');
        this.router.navigate(['/my-returns']);
      },
      error: () => this.toastr.error('حدث خطأ')
    });
  }

  goBack(): void {
    this.router.navigate(['/my-returns']);
  }
}