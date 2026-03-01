import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Order, OrderListItem, OrderStatus, PaymentStatus, ShipmentStatus } from '../../../../models/my-orders';
import { I18nService } from '../../../../core/services/i18n.service';
import { MyOrdersService } from '../../services/my-orders.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-orders',
  standalone: false,
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css',
})
export class MyOrdersComponent implements OnInit {
  // Data
  orders: OrderListItem[] = [];
  selectedOrder: any | null = null;

  // UI State
  isLoading = true;
  isLoadingDetails = false;
  showDetailsModal = false;
  activeFilter: 'all' | OrderStatus = 'all';

  // Toast
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  };

  // Enums for template
  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;
  ShipmentStatus = ShipmentStatus;

  constructor(
    public i18n: I18nService,
    private ordersService: MyOrdersService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.ordersService.getMyOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders = res.data;
          console.log('📦 Orders loaded:', this.orders);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading = false;
        this.showToast(
          this.i18n.currentLang === 'ar'
            ? 'حدث خطأ في تحميل الطلبات'
            : 'Error loading orders',
          'error'
        );
      }
    });
  }

  viewOrderDetails(orderId: number): void {
    this.isLoadingDetails = true;
    this.showDetailsModal = true;

    this.ordersService.getOrderById(orderId).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedOrder = res.data;
          console.log('📋 Order details:', this.selectedOrder);
        }
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading order details:', err);
        this.isLoadingDetails = false;
        this.showDetailsModal = false;
        this.showToast(
          this.i18n.currentLang === 'ar'
            ? 'حدث خطأ في تحميل تفاصيل الطلب'
            : 'Error loading order details',
          'error'
        );
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  cancelOrder(orderId: number): void {
    if (!confirm(
      this.i18n.currentLang === 'ar'
        ? 'هل أنت متأكد من إلغاء هذا الطلب؟'
        : 'Are you sure you want to cancel this order?'
    )) {
      return;
    }

    this.ordersService.cancelOrder(orderId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar'
              ? 'تم إلغاء الطلب بنجاح'
              : 'Order cancelled successfully',
            'success'
          );
          this.loadOrders();
          this.closeDetailsModal();
        } else {
          this.showToast(res.message, 'error');
        }
      },
      error: (err) => {
        this.showToast(
          err.error?.message || (this.i18n.currentLang === 'ar'
            ? 'حدث خطأ أثناء إلغاء الطلب'
            : 'Error cancelling order'),
          'error'
        );
      }
    });
  }

  filterOrders(filter: 'all' | OrderStatus): void {
    this.activeFilter = filter;
  }

  get filteredOrders(): OrderListItem[] {
    if (this.activeFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(o => o.status === this.activeFilter);
  }

  // Helpers
  getStatusBadge(status: OrderStatus): { text: string; class: string } {
    const statusMap = {
      [OrderStatus.Pending]: {
        ar: 'في الانتظار',
        en: 'Pending',
        class: 'pending'
      },
      [OrderStatus.Confirmed]: {
        ar: 'مؤكد',
        en: 'Confirmed',
        class: 'confirmed'
      },
      [OrderStatus.Processing]: {
        ar: 'قيد المعالجة',
        en: 'Processing',
        class: 'processing'
      },
      [OrderStatus.Shipped]: {
        ar: 'جاهز للاستلام',
        en: 'Ready for pickup',
        class: 'shipped'
      },
      [OrderStatus.OutForDelivery]: {
        ar: 'في الطريق',
        en: 'Out for Delivery',
        class: 'out-for-delivery'
      },
      [OrderStatus.Delivered]: {
        ar: 'تم التوصيل',
        en: 'Delivered',
        class: 'delivered'
      },
      [OrderStatus.Cancelled]: {
        ar: 'ملغي',
        en: 'Cancelled',
        class: 'cancelled'
      },
       [OrderStatus.DeliveryFailed]: {
        ar: 'فشل التوصيل',
        en: 'Delivery Failed',
        class: 'delivery-failed'
      }
    };

    const info = statusMap[status];
    return {
      text: this.i18n.currentLang === 'ar' ? info.ar : info.en,
      class: info.class
    };
  }

  getPaymentStatusBadge(status: PaymentStatus): { text: string; class: string } {
    const statusMap = {
      [PaymentStatus.Pending]: {
        ar: 'في الانتظار',
        en: 'Pending',
        class: 'pending'
      },
      [PaymentStatus.Paid]: {
        ar: 'مدفوع',
        en: 'Paid',
        class: 'paid'
      },
      [PaymentStatus.Failed]: {
        ar: 'فشل',
        en: 'Failed',
        class: 'failed'
      },
      [PaymentStatus.Refunded]: {
        ar: 'مسترد',
        en: 'Refunded',
        class: 'refunded'
      }
    };

    const info = statusMap[status];
    return {
      text: this.i18n.currentLang === 'ar' ? info.ar : info.en,
      class: info.class
    };
  }

  getPaymentMethodLabel(method: string): string {
    const methods: { [key: string]: { ar: string; en: string } } = {
      'COD': { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery' },
      'Visa': { ar: 'بطاقة ائتمان', en: 'Credit Card' },
      'visa': { ar: 'بطاقة ائتمان', en: 'Credit Card' }
    };

    return methods[method]
      ? (this.i18n.currentLang === 'ar' ? methods[method].ar : methods[method].en)
      : method;
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString(
      this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  }

  formatDateTime(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString(
      this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.Pending ||
      order.status === OrderStatus.Confirmed;
  }

  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  getTrackingSteps(order: Order): any[] {
    // لو في Shipment، استخدم ShipmentStatus
    if (order.shipmentBarcode && order.shipmentStatus !== undefined) {
      return this.getShipmentTrackingSteps(order);
    }

    // Otherwise use OrderStatus
    return this.getOrderTrackingSteps(order.status);
  }

  getShipmentTrackingSteps(order: Order): any[] {
    const status = order.shipmentStatus!;

    const steps = [
      {
        statusValue: ShipmentStatus.Pending,
        icon: 'fa-clipboard-check',
        labelAr: 'تم استلام الطلب',
        labelEn: 'Order Received',
        descAr: 'تم استلام طلبك بنجاح',
        descEn: 'Your order has been received'
      },
      {
        statusValue: ShipmentStatus.Processing,
        icon: 'fa-box',
        labelAr: 'جاري التجهيز',
        labelEn: 'Processing',
        descAr: 'جاري تجميع منتجاتك من التجار',
        descEn: 'Collecting items from vendors'
      },
      {
        statusValue: ShipmentStatus.ReadyForPickup,
        icon: 'fa-warehouse',
        labelAr: 'جاهز للاستلام',
        labelEn: 'Ready',
        descAr: order.isReadyForPickup
          ? 'شحنتك جاهزة للاستلام من المخزن'
          : 'في انتظار وصول جميع المنتجات',
        descEn: order.isReadyForPickup
          ? 'Your shipment is ready for pickup'
          : 'Waiting for all items to arrive'
      },
      {
        statusValue: ShipmentStatus.OutForDelivery,
        icon: 'fa-truck',
        labelAr: 'في الطريق',
        labelEn: 'Out for Delivery',
        descAr: 'المندوب في طريقه إليك',
        descEn: 'Delivery agent is on the way'
      },
      {
        statusValue: ShipmentStatus.Delivered,
        icon: 'fa-circle-check',
        labelAr: 'تم التوصيل',
        labelEn: 'Delivered',
        descAr: 'تم استلام طلبك بنجاح',
        descEn: 'Order delivered successfully'
      }
    ];

    return steps.map((step, index) => ({
      ...step,
      label: this.i18n.currentLang === 'ar' ? step.labelAr : step.labelEn,
      desc: this.i18n.currentLang === 'ar' ? step.descAr : step.descEn,
      completed: step.statusValue < status,
      active: step.statusValue === status,
      pending: step.statusValue > status,
      last: index === steps.length - 1
    }));
  }

  getProgressPercentage(order: Order): number {
    if (order.shipmentStatus !== undefined) {
      const totalSteps = 5;
      const currentStep = order.shipmentStatus;
      return (currentStep / (totalSteps - 1)) * 100;
    }

    const totalSteps = 5;
    const currentStep = order.status;
    return (currentStep / (totalSteps - 1)) * 100;
  }

  getOrderTrackingSteps(status: OrderStatus): any[] {
    const steps = [
      {
        statusValue: OrderStatus.Pending,
        icon: 'fa-clock',
        labelAr: 'في الانتظار',
        labelEn: 'Pending'
      },
      {
        statusValue: OrderStatus.Confirmed,
        icon: 'fa-check',
        labelAr: 'مؤكد',
        labelEn: 'Confirmed'
      },
      {
        statusValue: OrderStatus.Processing,
        icon: 'fa-box',
        labelAr: 'قيد التجهيز',
        labelEn: 'Processing'
      },
      {
        statusValue: OrderStatus.Shipped,
        icon: 'fa-truck',
        labelAr: 'جاهز للاستلام',
        labelEn: 'Ready for pickup'
      },
       {
        statusValue: OrderStatus.OutForDelivery,
        icon: 'fa-motorcycle',
        labelAr: 'في الطريق',
        labelEn: 'Out for Delivery'
      },
      {
        statusValue: OrderStatus.Delivered,
        icon: 'fa-circle-check',
        labelAr: 'تم التوصيل',
        labelEn: 'Delivered'
      }
    ];

    return steps.map((step, index) => ({
      ...step,
      label: this.i18n.currentLang === 'ar' ? step.labelAr : step.labelEn,
      completed: step.statusValue < status,
      active: step.statusValue === status,
      pending: step.statusValue > status,
      last: index === steps.length - 1
    }));
  }

  // في الـ tracking steps، أضف خطوة DeliveryFailed:
  // getOrderTrackingSteps(status: OrderStatus): any[] {
  //   const steps = [
  //     {
  //       statusValue: OrderStatus.Pending,
  //       icon: 'fa-clock',
  //       labelAr: 'في الانتظار',
  //       labelEn: 'Pending'
  //     },
  //     {
  //       statusValue: OrderStatus.Confirmed,
  //       icon: 'fa-check',
  //       labelAr: 'مؤكد',
  //       labelEn: 'Confirmed'
  //     },
  //     {
  //       statusValue: OrderStatus.Processing,
  //       icon: 'fa-box',
  //       labelAr: 'قيد التجهيز',
  //       labelEn: 'Processing'
  //     },
  //     {
  //       statusValue: OrderStatus.Shipped,
  //       icon: 'fa-truck',
  //       labelAr: 'جاهز للاستلام',
  //       labelEn: 'Ready for pickup'
  //     },
  //     {
  //       statusValue: OrderStatus.OutForDelivery,
  //       icon: 'fa-motorcycle',
  //       labelAr: 'في الطريق',
  //       labelEn: 'Out for Delivery'
  //     },
  //     {
  //       statusValue: OrderStatus.Delivered,
  //       icon: 'fa-circle-check',
  //       labelAr: 'تم التوصيل',
  //       labelEn: 'Delivered'
  //     }
  //   ];

  //   // إذا كان الطلب فشل في التوصيل
  //   if (status === OrderStatus.DeliveryFailed) {
  //     steps.push({
  //       statusValue: OrderStatus.DeliveryFailed,
  //       icon: 'fa-exclamation-triangle',
  //       labelAr: 'فشل التوصيل',
  //       labelEn: 'Delivery Failed'
  //     });
  //   }

  //   return steps.map((step, index) => ({
  //     ...step,
  //     label: this.i18n.currentLang === 'ar' ? step.labelAr : step.labelEn,
  //     completed: step.statusValue < status,
  //     active: step.statusValue === status,
  //     pending: step.statusValue > status,
  //     last: index === steps.length - 1
  //   }));
  // }
}
