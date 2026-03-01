import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ShippingService } from '../../services/shipping.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { DeliveryAgentTask, VendorOrderStatus, DeliveryType } from '../../../../models/shipping';

@Component({
  selector: 'app-delivery-agent',
  standalone: false,
  templateUrl: './delivery-agent.component.html',
  styleUrl: './delivery-agent.component.css'
})
export class DeliveryAgentComponent implements OnInit {
  tasks: DeliveryAgentTask[] = [];
  isLoading = true;
  selectedTask: DeliveryAgentTask | null = null;
  showTaskModal = false;
  isUpdating = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // Enums
  VendorOrderStatus = VendorOrderStatus;
  DeliveryType = DeliveryType;

  constructor(
    public i18n: I18nService,
    private shippingService: ShippingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTasks();
    this.loadFailureReasons();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.shippingService.getAgentTasks().subscribe({
      next: (res) => {
        if (res.success) {
          this.tasks = res.data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showToast(this.t('error_loading'), 'error');
      }
    });
  }

  openTaskDetails(task: DeliveryAgentTask): void {
    this.selectedTask = task;
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.selectedTask = null;
  }

  // Actions
  pickFromVendor(task: DeliveryAgentTask): void {
    this.isUpdating = true;
    this.shippingService.pickFromVendor(task.vendorOrderId).subscribe({
      next: (res) => {
        this.isUpdating = false;
        if (res.success) {
          this.showToast(this.t('picked_success'), 'success');
          this.loadTasks();
          this.closeTaskModal();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: () => {
        this.isUpdating = false;
        this.showToast(this.t('error'), 'error');
      }
    });
  }

  deliverToWarehouse(task: DeliveryAgentTask): void {
    this.isUpdating = true;
    this.shippingService.deliverToWarehouse(task.vendorOrderId).subscribe({
      next: (res) => {
        this.isUpdating = false;
        if (res.success) {
          this.showToast(this.t('delivered_warehouse'), 'success');
          this.loadTasks();
          this.closeTaskModal();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: () => {
        this.isUpdating = false;
        this.showToast(this.t('error'), 'error');
      }
    });
  }

  deliverToCustomer(task: DeliveryAgentTask): void {
    this.isUpdating = true;
    this.shippingService.deliverToCustomer(task.vendorOrderId).subscribe({
      next: (res) => {
        this.isUpdating = false;
        if (res.success) {
          this.showToast(this.t('delivered_customer'), 'success');
          this.loadTasks();
          this.closeTaskModal();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: () => {
        this.isUpdating = false;
        this.showToast(this.t('error'), 'error');
      }
    });
  }

  // Helpers
  getTasksByStatus(status: VendorOrderStatus): DeliveryAgentTask[] {
    return this.tasks.filter(t => t.status === status);
  }

  getStatusIcon(status: VendorOrderStatus): string {
    const icons: { [key: number]: string } = {
      [VendorOrderStatus.Assigned]: 'fa-clock',
      [VendorOrderStatus.PickedFromVendor]: 'fa-box',
      [VendorOrderStatus.OutForDelivery]: 'fa-truck'
    };
    return icons[status] || 'fa-circle';
  }

  getNextAction(task: DeliveryAgentTask): { label: string; action: () => void; icon: string } | null {
    if (task.status === VendorOrderStatus.Assigned) {
      return {
        label: this.t('pick_from_vendor'),
        action: () => this.pickFromVendor(task),
        icon: 'fa-hand-holding-box'
      };
    }
    if (task.status === VendorOrderStatus.PickedFromVendor) {
      if (task.deliveryType === DeliveryType.ToWarehouse) {
        return {
          label: this.t('deliver_to_warehouse'),
          action: () => this.deliverToWarehouse(task),
          icon: 'fa-warehouse'
        };
      } else {
        return {
          label: this.t('deliver_to_customer'),
          action: () => this.deliverToCustomer(task),
          icon: 'fa-house-user'
        };
      }
    }
    return null;
  }

  openMaps(address: string): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  }

  callPhone(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }


  // Delivery Failure
  showFailureModal = false;
  selectedTaskForFailure: DeliveryAgentTask | null = null;
  failureReasons: { value: number; labelAr: string; labelEn: string }[] = [];
  selectedFailureReason: number | null = null;
  otherReason = '';
  isReportingFailure = false;

  loadFailureReasons(): void {
    // Static list - can also load from API
    this.failureReasons = [
      { value: 0, labelAr: 'العميل غير موجود', labelEn: 'Customer Not Available' },
      { value: 1, labelAr: 'العنوان غير صحيح', labelEn: 'Wrong Address' },
      { value: 2, labelAr: 'العميل رفض الاستلام', labelEn: 'Customer Refused' },
      { value: 3, labelAr: 'العميل طلب التأجيل', labelEn: 'Customer Requested Delay' },
      { value: 4, labelAr: 'الهاتف لا يرد', labelEn: 'Phone Not Answered' },
      { value: 5, labelAr: 'المنطقة يصعب الوصول إليها', labelEn: 'Area Not Accessible' },
      { value: 99, labelAr: 'سبب آخر', labelEn: 'Other' }
    ];
  }

  // Open failure modal
  openFailureModal(task: DeliveryAgentTask): void {
    this.selectedTaskForFailure = task;
    this.selectedFailureReason = null;
    this.otherReason = '';
    this.showFailureModal = true;
  }

  closeFailureModal(): void {
    this.showFailureModal = false;
    this.selectedTaskForFailure = null;
    this.selectedFailureReason = null;
    this.otherReason = '';
  }

  getReasonLabel(reason: { labelAr: string; labelEn: string }): string {
    return this.i18n.currentLang === 'ar' ? reason.labelAr : reason.labelEn;
  }

  reportDeliveryFailure(): void {
    if (this.selectedFailureReason === null) {
      this.showToast(this.t('select_reason'), 'error');
      return;
    }

    if (this.selectedFailureReason === 99 && !this.otherReason.trim()) {
      this.showToast(this.t('enter_reason'), 'error');
      return;
    }

    this.isReportingFailure = true;

    // استخدم الـ OrderService أو ShippingService
    // هنا نفترض استخدام OrderService
    const dto = {
      orderId: this.selectedTaskForFailure!.orderId, // لازم يكون في الـ task
      reason: this.selectedFailureReason,
      otherReason: this.selectedFailureReason === 99 ? this.otherReason : undefined
    };

    this.shippingService.reportDeliveryFailure(dto).subscribe({
      next: (res) => {
        this.isReportingFailure = false;
        if (res.success) {
          this.showToast(this.t('failure_reported'), 'success');
          this.closeFailureModal();
          this.loadTasks(); // Reload tasks
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: () => {
        this.isReportingFailure = false;
        this.showToast(this.t('error'), 'error');
      }
    });
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'error_loading': { ar: 'خطأ في تحميل المهام', en: 'Error loading tasks' },
      'pick_from_vendor': { ar: 'استلام من التاجر', en: 'Pick from Vendor' },
      'deliver_to_warehouse': { ar: 'تسليم للمخزن', en: 'Deliver to Warehouse' },
      'deliver_to_customer': { ar: 'تسليم للعميل', en: 'Deliver to Customer' },
      'picked_success': { ar: 'تم استلام المنتجات', en: 'Products picked up' },
      'delivered_warehouse': { ar: 'تم التسليم للمخزن', en: 'Delivered to warehouse' },
      'delivered_customer': { ar: 'تم التسليم للعميل', en: 'Delivered to customer' },
        'select_reason': { ar: 'اختر سبب الفشل', en: 'Select failure reason' },
      'enter_reason': { ar: 'أدخل السبب', en: 'Enter the reason' },
      'failure_reported': { ar: 'تم تسجيل فشل التوصيل', en: 'Delivery failure reported' },
      'report_failure': { ar: 'تسجيل فشل التوصيل', en: 'Report Delivery Failure' },
      'error': { ar: 'حدث خطأ', en: 'An error occurred' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }
}