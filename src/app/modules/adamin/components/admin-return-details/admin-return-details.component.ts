import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReturnRequestDetails, ReturnStatus, ReturnPickupType, RefundMethod, AdminReturnResponse, AssignReturnAgent, ReturnInspection, ProcessRefund } from '../../../../models/return';
import { ReturnService } from '../../../shipping/services/return-service';

interface DeliveryAgent {
  id: string;
  fullName: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-admin-return-details',
  standalone: false,
  templateUrl: './admin-return-details.component.html',
  styleUrl: './admin-return-details.component.css',
})
export class AdminReturnDetailsComponent implements OnInit {
  returnId!: number;
  returnRequest!: ReturnRequestDetails;
  loading = false;
  submitting = false;
 
  ReturnStatus = ReturnStatus;
  ReturnPickupType = ReturnPickupType;
  RefundMethod = RefundMethod;
 
  // For modals
  adminNotes = '';
  pickupType: ReturnPickupType = ReturnPickupType.AgentPickup;
  scheduledPickupDate: string = '';
  selectedAgentId = '';
  availableAgents: DeliveryAgent[] = [];
 
  // Inspection
  inspectionPassed = true;
  inspectionNotes = '';
 
  // Refund
  refundMethod: RefundMethod = RefundMethod.Wallet;
  customRefundAmount?: number;
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private returnService: ReturnService,
    private toastr: ToastrService
  ) {}
 
  ngOnInit(): void {
    this.returnId = +this.route.snapshot.params['id'];
    this.loadDetails();
    this.loadAgents();
  }
 
  loadDetails(): void {
    this.loading = true;
    this.returnService.getReturnDetails(this.returnId).subscribe({
      next: (res) => {
        if (res.success) {
          this.returnRequest = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.loading = false;
      }
    });
  }
 
  loadAgents(): void {
    // Load available delivery agents - implement based on your API
    // this.shippingService.getAvailableDeliveryAgents().subscribe(...)
  }
 
  // ==================== Admin Actions ====================
 
  approveReturn(): void {
    const dto: AdminReturnResponse = {
      returnRequestId: this.returnId,
      approved: true,
      notes: this.adminNotes,
      pickupType: this.pickupType,
      scheduledPickupDate: this.scheduledPickupDate ? new Date(this.scheduledPickupDate) : undefined
    };
 
    this.submitting = true;
    this.returnService.adminRespond(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('تم قبول طلب الإرجاع');
          this.loadDetails();
        } else {
          this.toastr.error(res.message);
        }
        this.submitting = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.submitting = false;
      }
    });
  }
 
  rejectReturn(): void {
    if (!this.adminNotes.trim()) {
      this.toastr.warning('يرجى ذكر سبب الرفض');
      return;
    }
 
    const dto: AdminReturnResponse = {
      returnRequestId: this.returnId,
      approved: false,
      notes: this.adminNotes
    };
 
    this.submitting = true;
    this.returnService.adminRespond(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('تم رفض طلب الإرجاع');
          this.loadDetails();
        } else {
          this.toastr.error(res.message);
        }
        this.submitting = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.submitting = false;
      }
    });
  }
 
  assignAgent(): void {
    if (!this.selectedAgentId || !this.scheduledPickupDate) {
      this.toastr.warning('يرجى اختيار المندوب وتحديد موعد الاستلام');
      return;
    }
 
    const dto: AssignReturnAgent = {
      returnRequestId: this.returnId,
      deliveryAgentId: this.selectedAgentId,
      scheduledPickupDate: new Date(this.scheduledPickupDate)
    };
 
    this.submitting = true;
    this.returnService.assignAgent(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('تم تعيين المندوب');
          this.loadDetails();
        } else {
          this.toastr.error(res.message);
        }
        this.submitting = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.submitting = false;
      }
    });
  }
 
  markReceived(): void {
    this.submitting = true;
    this.returnService.markReceived(this.returnId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('تم تسجيل وصول المرتجع');
          this.loadDetails();
        } else {
          this.toastr.error(res.message);
        }
        this.submitting = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.submitting = false;
      }
    });
  }
 
  recordInspection(): void {
    const dto: ReturnInspection = {
      returnRequestId: this.returnId,
      passed: this.inspectionPassed,
      notes: this.inspectionNotes,
      itemsInspection: this.returnRequest.items.map(item => ({
        returnItemId: item.id,
        passed: this.inspectionPassed,
        notes: '',
        returnToStock: this.inspectionPassed
      }))
    };
 
    this.submitting = true;
    this.returnService.recordInspection(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('تم تسجيل نتيجة الفحص');
          this.loadDetails();
        } else {
          this.toastr.error(res.message);
        }
        this.submitting = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.submitting = false;
      }
    });
  }
 
  processRefund(): void {
    const dto: ProcessRefund = {
      returnRequestId: this.returnId,
      method: this.refundMethod,
      customRefundAmount: this.customRefundAmount
    };
 
    this.submitting = true;
    this.returnService.processRefund(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('تم معالجة الاسترداد');
          this.loadDetails();
        } else {
          this.toastr.error(res.message);
        }
        this.submitting = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.submitting = false;
      }
    });
  }
 
  // ==================== Helpers ====================
 
  canApprove(): boolean {
    return this.returnRequest?.status === ReturnStatus.VendorApproved;
  }
 
  canAssignAgent(): boolean {
    return this.returnRequest?.status === ReturnStatus.AdminApproved ||
           this.returnRequest?.status === ReturnStatus.PickupScheduled;
  }
 
  canMarkReceived(): boolean {
    return this.returnRequest?.status === ReturnStatus.PickedUp ||
           this.returnRequest?.status === ReturnStatus.AdminApproved;
  }
 
  canInspect(): boolean {
    return this.returnRequest?.status === ReturnStatus.InWarehouse;
  }
 
  canProcessRefund(): boolean {
    return this.returnRequest?.status === ReturnStatus.InspectionPassed ||
           this.returnRequest?.status === ReturnStatus.AdminApproved;
  }
 
  getStatusClass(status: ReturnStatus): string {
    switch (status) {
      case ReturnStatus.Pending:
      case ReturnStatus.VendorApproved:
        return 'bg-warning';
      case ReturnStatus.VendorRejected:
      case ReturnStatus.AdminRejected:
      case ReturnStatus.InspectionFailed:
        return 'bg-danger';
      case ReturnStatus.RefundCompleted:
        return 'bg-success';
      default:
        return 'bg-info';
    }
  }
}
