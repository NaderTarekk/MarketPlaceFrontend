import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ShippingService } from '../../services/shipping.service';
import { I18nService } from '../../../../core/services/i18n.service';
import {
  VendorOrder,
  DeliveryAgent,
  VendorOrderStatus,
  DeliveryType,
  ShipmentListItem,
  ShipmentStatus
} from '../../../../models/shipping';
import { environment } from '../../../../../environment';
import { ReturnService } from '../../services/return-service';
import { ReturnStatus } from '../../../../models/return';
import { BarcodeService } from '../../../../core/services/barcode.service';

@Component({
  selector: 'app-shipping-employee',
  standalone: false,
  templateUrl: './shipping-employee.component.html',
  styleUrl: './shipping-employee.component.css'
})
export class ShippingEmployeeComponent implements OnInit {
  // Data
  pendingOrders: VendorOrder[] = [];
  shipments: ShipmentListItem[] = [];
  deliveryAgents: DeliveryAgent[] = [];
  pendingReturns: any[] = [];
  selectedReturn: any = null;
  showAssignReturnModal = false;
scheduledPickupDate: string = '';

  orderDeliveryTypes: Map<number, DeliveryType> = new Map();
  // UI State
  isLoading = true;
 activeTab: 'pending' | 'shipments' | 'agents' | 'warehouse' | 'returns' = 'pending';

  // Assignment
  selectedOrders: number[] = [];
  selectedAgent: string = '';
  selectedDeliveryType: DeliveryType = DeliveryType.ToWarehouse;
  isAssigning = false;

  deliveryTypeFilter: DeliveryType | null = null;

  // Modal
  showAssignModal = false;
  showShipmentModal = false;
  selectedShipment: any = null;
  deliveryFailures: any[] = [];

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // Enums
  VendorOrderStatus = VendorOrderStatus;
  DeliveryType = DeliveryType;
  ShipmentStatus = ShipmentStatus;

  showPickupConfirmModal = false;
  shipmentToPickupId: number | null = null;

  constructor(
    public i18n: I18nService,
    private shippingService: ShippingService,
    private cdr: ChangeDetectorRef,
    private returnService: ReturnService,
    private barcodeService: BarcodeService
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.loadFailureReasons();
    this.loadDeliveryOptions();
  }

  loadData(): void {
    this.isLoading = true;

    // Load pending orders
    this.shippingService.getPendingVendorOrders().subscribe({
      next: (res) => {
        if (res.success) {
          console.log(res);

          this.pendingOrders = res.data.map(order => ({
            ...order,
            items: order.items.map(item => ({
              ...item,
              productImage: this.getImageUrl(item.productImage)
            }))
          }));
          this.pendingOrders.forEach(order => {
            this.orderDeliveryTypes.set(order.id, order.deliveryType);
          });
        }
        this.cdr.detectChanges();
      }
    });

    this.returnService.getAllReturns({
      page: 1,
      pageSize: 50,
      status: ReturnStatus.AdminApproved
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pendingReturns = res.data || [];
        }
      }
    });

    this.shippingService.getUnresolvedFailures().subscribe({
      next: (res) => {
        if (res.success) {
          this.deliveryFailures = res.data;
        }
      }
    });

    // Load shipments
    this.shippingService.getAllShipments({ page: 1, pageSize: 50 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.shipments = res.data;
        }
        this.cdr.detectChanges();
      }
    });

    // Load delivery agents
    this.shippingService.getAvailableDeliveryAgents().subscribe({
      next: (res) => {
        if (res.success) {
          this.deliveryAgents = res.data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openAssignReturnModal(ret: any): void {
    this.selectedReturn = ret;
    this.selectedAgent = '';
    this.showAssignReturnModal = true;
  }

get today(): string {
  return new Date().toISOString().split('T')[0];
}

closeAssignReturnModal(): void {
  this.showAssignReturnModal = false;
  this.selectedReturn = null;
  this.scheduledPickupDate = '';  // ✅ reset
}
 confirmReturnAssignment(): void {
  if (!this.selectedAgent) {
    this.showToast(this.t('select_agent'), 'error');
    return;
  }

  if (!this.scheduledPickupDate) {
    this.showToast(
      this.i18n.currentLang === 'ar' ? 'اختر تاريخ الاستلام' : 'Select pickup date',
      'error'
    );
    return;
  }

  this.isAssigning = true;

  this.returnService.assignAgent({
    returnRequestId: this.selectedReturn.id,
    deliveryAgentId: this.selectedAgent,
    scheduledPickupDate: new Date(this.scheduledPickupDate)  // ✅ أضف ده
  }).subscribe({
    next: (res: any) => {
      this.isAssigning = false;
      if (res.success) {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'تم تعيين المندوب بنجاح' : 'Agent assigned successfully',
          'success'
        );
        this.closeAssignReturnModal();
        this.loadData();
      } else {
        this.showToast(res.message || this.t('error'), 'error');
      }
    },
    error: () => {
      this.isAssigning = false;
      this.showToast(this.t('error'), 'error');
    }
  });
}

  getImageUrl(image: string | null): string {
    if (!image) return 'assets/images/placeholder.png';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  // Selection
  toggleOrderSelection(orderId: number): void {
    const index = this.selectedOrders.indexOf(orderId);
    const orderDeliveryType = this.orderDeliveryTypes.get(orderId);

    if (index > -1) {
      // Remove from selection
      this.selectedOrders.splice(index, 1);
    } else {
      // Add to selection - but check if compatible
      if (this.selectedOrders.length > 0) {
        // Check if all selected orders have same delivery type
        const firstOrderId = this.selectedOrders[0];
        const firstDeliveryType = this.orderDeliveryTypes.get(firstOrderId);

        if (orderDeliveryType !== firstDeliveryType) {
          // ❌ Different delivery type - show error
          this.showToast(
            this.i18n.currentLang === 'ar'
              ? 'لا يمكن اختيار طلبات بأنواع توصيل مختلفة معاً'
              : 'Cannot select orders with different delivery types together',
            'error'
          );
          return;
        }
      }

      this.selectedOrders.push(orderId);
    }
  }

  isOrderSelected(orderId: number): boolean {
    return this.selectedOrders.includes(orderId);
  }

  selectAllOrders(): void {
    if (this.selectedOrders.length === this.pendingOrders.length) {
      this.selectedOrders = [];
    } else {
      // ✅ Group orders by delivery type first
      const deliveryTypeGroups = new Map<DeliveryType, number[]>();

      this.pendingOrders.forEach(order => {
        const type = order.deliveryType;
        if (!deliveryTypeGroups.has(type)) {
          deliveryTypeGroups.set(type, []);
        }
        deliveryTypeGroups.get(type)!.push(order.id);
      });

      // ✅ If all orders have same type, select all
      if (deliveryTypeGroups.size === 1) {
        this.selectedOrders = this.pendingOrders.map(o => o.id);
      } else {
        // ✅ Show warning - cannot select all with mixed types
        this.showToast(
          this.i18n.currentLang === 'ar'
            ? 'يوجد طلبات بأنواع توصيل مختلفة. اختر نوعاً واحداً فقط'
            : 'Orders have different delivery types. Select one type only',
          'error'
        );
      }
    }
  }


  getOrdersByDeliveryType(type: DeliveryType): VendorOrder[] {
    return this.pendingOrders.filter(o => o.deliveryType === type);
  }

  getFilteredOrders(): VendorOrder[] {
    if (this.deliveryTypeFilter === null) {
      return this.pendingOrders;
    }
    return this.getOrdersByDeliveryType(this.deliveryTypeFilter);
  }

  canSelectOrder(orderId: number): boolean {
    // If nothing selected, can select any
    if (this.selectedOrders.length === 0) {
      return true;
    }

    // Check if same delivery type as first selected
    const firstOrderId = this.selectedOrders[0];
    const firstDeliveryType = this.orderDeliveryTypes.get(firstOrderId);
    const thisDeliveryType = this.orderDeliveryTypes.get(orderId);

    return firstDeliveryType === thisDeliveryType;
  }

  // Assignment Modal
  openAssignModal(): void {
    if (this.selectedOrders.length === 0) {
      this.showToast(this.t('select_orders_first'), 'error');
      return;
    }

    // ✅ Check if all selected orders have the same delivery type
    const firstOrderId = this.selectedOrders[0];
    const firstDeliveryType = this.orderDeliveryTypes.get(firstOrderId);

    const allSameType = this.selectedOrders.every(orderId =>
      this.orderDeliveryTypes.get(orderId) === firstDeliveryType
    );

    if (allSameType && firstDeliveryType !== undefined) {
      this.selectedDeliveryType = firstDeliveryType;
    } else {
      // Mixed delivery types - keep default
      this.selectedDeliveryType = DeliveryType.ToWarehouse;
    }

    this.showAssignModal = true;
  }

  getDeliveryTypeLabel(deliveryType: DeliveryType): string {
    return deliveryType === DeliveryType.ToWarehouse
      ? (this.i18n.currentLang === 'ar' ? 'للمخزن' : 'To Warehouse')
      : (this.i18n.currentLang === 'ar' ? 'للعميل مباشرة' : 'Direct to Customer');
  }


  getDeliveryTypeIcon(deliveryType: DeliveryType): string {
    return deliveryType === DeliveryType.ToWarehouse ? 'fa-warehouse' : 'fa-house-user';
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedAgent = '';
    this.selectedDeliveryType = DeliveryType.ToWarehouse;
  }

  confirmAssignment(): void {
    if (!this.selectedAgent) {
      this.showToast(this.t('select_agent'), 'error');
      return;
    }

    this.isAssigning = true;

    if (this.selectedOrders.length === 1) {
      // Single assignment
      this.shippingService.assignDeliveryAgent({
        vendorOrderId: this.selectedOrders[0],
        deliveryAgentId: this.selectedAgent,
        deliveryType: this.selectedDeliveryType
      }).subscribe({
        next: (res) => this.handleAssignmentResult(res),
        error: () => this.handleAssignmentError()
      });
    } else {
      // Bulk assignment
      this.shippingService.bulkAssignDeliveryAgent({
        vendorOrderIds: this.selectedOrders,
        deliveryAgentId: this.selectedAgent,
        deliveryType: this.selectedDeliveryType
      }).subscribe({
        next: (res) => this.handleAssignmentResult(res),
        error: () => this.handleAssignmentError()
      });
    }
  }

  private handleAssignmentResult(res: any): void {
    this.isAssigning = false;
    if (res.success) {
      this.showToast(res.message || this.t('assignment_success'), 'success');
      this.closeAssignModal();
      this.selectedOrders = [];
      this.loadData();
    } else {
      this.showToast(res.message || this.t('assignment_failed'), 'error');
    }
  }

  private handleAssignmentError(): void {
    this.isAssigning = false;
    this.showToast(this.t('assignment_failed'), 'error');
  }

  // Shipment Details
  viewShipmentDetails(shipment: ShipmentListItem): void {
    this.shippingService.getShipmentById(shipment.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedShipment = res.data;

          // ✅ DEBUG: Check what we got
          console.log('📦 Selected Shipment:', this.selectedShipment);
          console.log('Status:', this.selectedShipment.status);
          console.log('Is Ready:', this.selectedShipment.isReadyForPickup);

          this.showShipmentModal = true;
          this.cdr.detectChanges(); // ✅ Force UI update
          this.renderShipmentBarcode();
        }
      }
    });
  }

  renderShipmentBarcode(): void {
    const orderNumber = this.selectedShipment?.orderNumber;
    if (!orderNumber) return;
    setTimeout(() => {
      const canvas = document.getElementById('shipment-barcode-canvas') as HTMLCanvasElement;
      if (canvas) {
        this.barcodeService.renderToCanvas(canvas, orderNumber, { size: 200 });
      }
    }, 50);
  }

  downloadShipmentBarcodeImage(): void {
    const orderNumber = this.selectedShipment?.orderNumber;
    if (!orderNumber) return;
    this.barcodeService.downloadAsPng(orderNumber, `${orderNumber}-qr.png`);
  }

  downloadShipmentBarcodePdf(): void {
    const orderNumber = this.selectedShipment?.orderNumber;
    if (!orderNumber) return;
    this.barcodeService.downloadAsPdf({
      barcodeValue: orderNumber,
      orderNumber,
      totalAmount: this.selectedShipment?.totalAmount || 0,
      customerName: this.selectedShipment?.customerName,
      filename: `${orderNumber}-qr.pdf`
    });
  }

  closeShipmentModal(): void {
    this.showShipmentModal = false;
    this.selectedShipment = null;
  }

  markAsReadyForPickup(shipmentId: number): void {
    this.shippingService.markReadyForPickup(shipmentId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('ready_for_pickup'), 'success');
          this.loadData();
          this.closeShipmentModal();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      }
    });
  }

  markAsDelivered(shipmentId: number): void {
    this.shippingService.markShipmentDelivered(shipmentId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('delivered_success'), 'success');
          this.loadData();
          this.closeShipmentModal();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      }
    });
  }

  // Helpers
  getStatusBadgeClass(status: VendorOrderStatus | ShipmentStatus): string {
    const statusMap: { [key: number]: string } = {
      0: 'pending',
      1: 'processing',
      2: 'partial',
      3: 'ready',
      4: 'out-for-delivery',
      5: 'delivered',
      6: 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  getStatusBadgeText(status: VendorOrderStatus): string {
    const statusMap: { [key: number]: { ar: string; en: string } } = {
      [VendorOrderStatus.Pending]: { ar: 'قيد الانتظار', en: 'Pending' },
      [VendorOrderStatus.Assigned]: { ar: 'قم بتعيين مندوب', en: 'Assign Agent' }, // ✅ CHANGED
      [VendorOrderStatus.PickedFromVendor]: { ar: 'تم الاستلام من التاجر', en: 'Picked from Vendor' },
      [VendorOrderStatus.InWarehouse]: { ar: 'في المخزن', en: 'In Warehouse' },
      [VendorOrderStatus.OutForDelivery]: { ar: 'في الطريق', en: 'Out for Delivery' },
      [VendorOrderStatus.Delivered]: { ar: 'تم التسليم', en: 'Delivered' },
      [VendorOrderStatus.Cancelled]: { ar: 'ملغي', en: 'Cancelled' }
    };

    const info = statusMap[status] || { ar: 'غير معروف', en: 'Unknown' };
    return this.i18n.currentLang === 'ar' ? info.ar : info.en;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }



  showFailureModal = false;
  selectedOrderForFailure: any = null;
  failureReasons: { value: number; labelAr: string; labelEn: string }[] = [];
  selectedFailureReason: number | null = null;
  otherReason = '';
  isReportingFailure = false;

  // Customer Choice Modal
  showCustomerChoiceModal = false;
  selectedFailureForChoice: any = null;
  deliveryOptions: { value: number; labelAr: string; labelEn: string }[] = [];
  selectedDeliveryOption: number | null = null;
  customerNotes = '';
  isSettingChoice = false;

  loadFailureReasons(): void {
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

  loadDeliveryOptions(): void {
    this.deliveryOptions = [
      { value: 0, labelAr: 'استلام من المنزل', labelEn: 'Home Delivery' },
      { value: 1, labelAr: 'استلام من شركة الشحن', labelEn: 'Pickup from Company' }
    ];
  }

  // Report Failure

  openFailureModal(shipment: any): void {
    console.log('🔴 Opening Failure Modal'); // ✅ DEBUG
    console.log('Shipment:', shipment);

    this.selectedOrderForFailure = shipment;
    this.selectedFailureReason = null;
    this.otherReason = '';
    this.showFailureModal = true;

    console.log('showFailureModal:', this.showFailureModal); // ✅ DEBUG

    this.cdr.detectChanges(); // ✅ Force update
  }

  closeFailureModal(): void {
    this.showFailureModal = false;
    this.selectedOrderForFailure = null;
  }

  reportDeliveryFailure(): void {
    if (this.selectedFailureReason === null) {
      this.showToast(this.t('select_reason'), 'error');
      return;
    }

    this.isReportingFailure = true;

    const dto = {
      orderId: this.selectedOrderForFailure.orderId,
      reason: this.selectedFailureReason,
      otherReason: this.selectedFailureReason === 99 ? this.otherReason : undefined
    };

    this.shippingService.reportDeliveryFailure(dto).subscribe({
      next: (res) => {
        this.isReportingFailure = false;
        if (res.success) {
          this.showToast(this.t('failure_reported'), 'success');
          this.closeFailureModal();
          this.loadData();
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

  // Set Customer Choice
  openCustomerChoiceModal(failure: any): void {
    this.selectedFailureForChoice = failure;
    this.selectedDeliveryOption = null;
    this.customerNotes = '';
    this.showCustomerChoiceModal = true;
  }

  closeCustomerChoiceModal(): void {
    this.showCustomerChoiceModal = false;
    this.selectedFailureForChoice = null;
  }

  setCustomerChoice(): void {
    if (this.selectedDeliveryOption === null) {
      this.showToast(this.t('select_option'), 'error');
      return;
    }

    this.isSettingChoice = true;

    const dto = {
      failureId: this.selectedFailureForChoice.id,
      customerChoice: this.selectedDeliveryOption,
      customerNotes: this.customerNotes || undefined
    };

    this.shippingService.setCustomerChoice(dto).subscribe({
      next: (res) => {
        this.isSettingChoice = false;
        if (res.success) {
          this.showToast(this.t('choice_saved'), 'success');
          this.closeCustomerChoiceModal();
          this.loadData();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: () => {
        this.isSettingChoice = false;
        this.showToast(this.t('error'), 'error');
      }
    });
  }

  getReasonLabel(reason: { labelAr: string; labelEn: string }): string {
    return this.i18n.currentLang === 'ar' ? reason.labelAr : reason.labelEn;
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'select_orders_first': { ar: 'اختر طلبات أولاً', en: 'Select orders first' },
      'select_agent': { ar: 'اختر مندوب', en: 'Select delivery agent' },
      'assignment_success': { ar: 'قم بتعيين المندوب', en: 'Please assign agent' },
      'assignment_failed': { ar: 'فشل في تعيين المندوب', en: 'Failed to assign agent' },
      'ready_for_pickup': { ar: 'الشحنة جاهزة للاستلام', en: 'Shipment ready for pickup' },
      'delivered_success': { ar: 'تم تسليم الشحنة', en: 'Shipment delivered' },
      'customer_picked_up': { ar: 'تم استلام الشحنة من العميل', en: 'Customer picked up shipment' },
      'select_reason': { ar: 'اختر سبب الفشل', en: 'Select failure reason' },
      'failure_reported': { ar: 'تم تسجيل فشل التوصيل', en: 'Delivery failure reported' },
      'select_option': { ar: 'اختر طريقة الاستلام', en: 'Select delivery option' },
      'choice_saved': { ar: 'تم حفظ اختيار العميل', en: 'Customer choice saved' },
      'error': { ar: 'حدث خطأ', en: 'An error occurred' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }

  markAsPickedByCustomer(shipmentId: number): void {
    this.shipmentToPickupId = shipmentId;
    this.showPickupConfirmModal = true;
    this.showShipmentModal = false;
    this.cdr.detectChanges();
  }

  confirmPickup(): void {
    if (!this.shipmentToPickupId) return;

    this.shippingService.markShipmentDelivered(this.shipmentToPickupId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar'
              ? 'تم تأكيد استلام العميل للشحنة'
              : 'Customer pickup confirmed',
            'success'
          );
          this.loadData();
          this.closeShipmentModal();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || this.t('error'), 'error');
      }
    });

    this.showPickupConfirmModal = false;
    this.shipmentToPickupId = null;
  }

  cancelPickup(): void {
    this.showPickupConfirmModal = false;
    this.shipmentToPickupId = null;
    this.showShipmentModal = true;
  }
}