import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ShippingService } from '../../services/shipping.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { VendorPendingOrder, VendorOrderStatus } from '../../../../models/shipping';

@Component({
  selector: 'app-vendor-shipping',
  standalone: false,
  templateUrl: './vendor-shipping.component.html',
  styleUrl: './vendor-shipping.component.css'
})
export class VendorShippingComponent implements OnInit {
  orders: VendorPendingOrder[] = [];
  isLoading = true;
  selectedOrder: VendorPendingOrder | null = null;
  showOrderModal = false;
  isConfirming = false;
  activeFilter: VendorOrderStatus | 'all' = 'all';

  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  VendorOrderStatus = VendorOrderStatus;

  statusFilters: { value: VendorOrderStatus | 'all'; labelAr: string; labelEn: string }[] = [
    { value: 'all', labelAr: 'الكل', labelEn: 'All' },
    { value: VendorOrderStatus.Pending, labelAr: 'قيد الانتظار', labelEn: 'Pending' },
    { value: VendorOrderStatus.Assigned, labelAr: 'تم التعيين', labelEn: 'Assigned' },
    { value: VendorOrderStatus.PickedFromVendor, labelAr: 'تم الاستلام من التاجر', labelEn: 'Picked from Vendor' },
    { value: VendorOrderStatus.InWarehouse, labelAr: 'في المخزن', labelEn: 'In Warehouse' },
    { value: VendorOrderStatus.OutForDelivery, labelAr: 'المندوب في الطريق', labelEn: 'Out for Delivery' },
    { value: VendorOrderStatus.Delivered, labelAr: 'تم التسليم', labelEn: 'Delivered' },
    { value: VendorOrderStatus.Cancelled, labelAr: 'ملغي', labelEn: 'Cancelled' },
  ];

  constructor(
    public i18n: I18nService,
    private shippingService: ShippingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.shippingService.getVendorAllOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders = res.data;
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

  get filteredOrders(): VendorPendingOrder[] {
    if (this.activeFilter === 'all') return this.orders;
    return this.orders.filter(o => o.status === this.activeFilter);
  }

  openOrderDetails(order: VendorPendingOrder): void {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  confirmHandover(order: VendorPendingOrder): void {
    this.isConfirming = true;
    this.shippingService.confirmHandoverToAgent(order.vendorOrderId).subscribe({
      next: (res) => {
        this.isConfirming = false;
        if (res.success) {
          this.showToast(this.t('handover_success'), 'success');
          this.loadOrders();
          this.closeOrderModal();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: () => {
        this.isConfirming = false;
        this.showToast(this.t('error'), 'error');
      }
    });
  }

  getStatusBadgeClass(status: VendorOrderStatus): string {
    const map: { [key: number]: string } = {
      [VendorOrderStatus.Pending]: 'pending',
      [VendorOrderStatus.Assigned]: 'assigned',
      [VendorOrderStatus.PickedFromVendor]: 'picked',
      [VendorOrderStatus.InWarehouse]: 'warehouse',
      [VendorOrderStatus.OutForDelivery]: 'out-for-delivery',
      [VendorOrderStatus.Delivered]: 'delivered',
      [VendorOrderStatus.Cancelled]: 'cancelled',
    };
    return map[status] || 'pending';
  }

  getStatusLabel(status: VendorOrderStatus): string {
    const map: { [key: number]: { ar: string; en: string } } = {
      [VendorOrderStatus.Pending]: { ar: 'قيد الانتظار', en: 'Pending' },
      [VendorOrderStatus.Assigned]: { ar: 'تم تعيين مندوب', en: 'Agent Assigned' },
      [VendorOrderStatus.PickedFromVendor]: { ar: 'تم الاستلام من التاجر', en: 'Picked from Vendor' },
      [VendorOrderStatus.InWarehouse]: { ar: 'في المخزن', en: 'In Warehouse' },
      [VendorOrderStatus.OutForDelivery]: { ar: 'المندوب في الطريق للعميل', en: 'Driver on the Way' },
      [VendorOrderStatus.Delivered]: { ar: 'تم التسليم', en: 'Delivered' },
      [VendorOrderStatus.Cancelled]: { ar: 'ملغي', en: 'Cancelled' },
    };
    const info = map[status] || { ar: 'غير معروف', en: 'Unknown' };
    return this.i18n.currentLang === 'ar' ? info.ar : info.en;
  }

  getCountByStatus(status: VendorOrderStatus | 'all'): number {
    if (status === 'all') return this.orders.length;
    return this.orders.filter(o => o.status === status).length;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'error_loading': { ar: 'خطأ في تحميل الطلبات', en: 'Error loading orders' },
      'handover_success': { ar: 'تم تأكيد التسليم للمندوب', en: 'Handover confirmed' },
      'error': { ar: 'حدث خطأ', en: 'An error occurred' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }
}
