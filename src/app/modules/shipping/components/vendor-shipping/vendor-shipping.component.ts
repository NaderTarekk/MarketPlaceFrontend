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

  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  VendorOrderStatus = VendorOrderStatus;

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
    this.shippingService.getVendorPendingOrders().subscribe({
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
      [VendorOrderStatus.PickedFromVendor]: 'picked'
    };
    return map[status] || 'pending';
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