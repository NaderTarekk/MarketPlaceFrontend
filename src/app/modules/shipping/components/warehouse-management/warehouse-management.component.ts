// src/app/modules/warehouse/components/warehouse-management/warehouse-management.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { Shelf, WarehouseOrder, CustomerOrders, WarehouseOrderStatus, CreateShelf, PickupOrder, SearchWarehouse, StoreOrderInShelf } from '../../../../models/warehouse';
import { WarehouseService } from '../../services/warehouse.service';

@Component({
  selector: 'app-warehouse-management',
  standalone: false,
  templateUrl: './warehouse-management.component.html',
  styleUrl: './warehouse-management.component.css'
})
export class WarehouseManagementComponent implements OnInit {
  // Data
  shelves: Shelf[] = [];
  orders: WarehouseOrder[] = [];
  customerOrders: CustomerOrders | null = null;

  // UI State
  isLoading = true;
  activeTab: 'scan' | 'shelves' | 'orders' = 'scan';

  // Scan Mode
  scanMode: 'customer' | 'order' | 'shelf' = 'customer';
  scannedOrderQR = '';
  scannedShelfQR = '';
  scannedCustomerQR = '';
  
  // Current Scan
  currentOrder: WarehouseOrder | null = null;
  currentShelf: Shelf | null = null;

  // Search
  searchQuery = '';
  searchType: 'order' | 'phone' | 'qr' = 'order';
  searchResults: WarehouseOrder[] = [];

  // Modals
  showCreateShelfModal = false;
  showOrderDetailsModal = false;
  showCustomerOrdersModal = false;
  
  newShelf: CreateShelf = { code: '', description: '' };
  notes = '';

  currentScanInput = '';
  // Toast
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  };

  showDeleteConfirmModal = false;
shelfToDeleteId: number | null = null;

  // Enums
  WarehouseOrderStatus = WarehouseOrderStatus;

  constructor(
    public i18n: I18nService,
    private warehouseService: WarehouseService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // Load shelves
    this.warehouseService.getAllShelves().subscribe({
      next: (res) => {
        if (res.success) {
          this.shelves = res.data;
        }
      }
    });

    // Load orders
    this.warehouseService.getWarehouseOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders = res.data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // ===== SCANNING =====

  scanQRCode(qrCode: string): void {
    if (!qrCode.trim()) {
      this.showToast(this.t('enter_qr'), 'error');
      return;
    }

    if (this.scanMode === 'customer') {
      this.scanCustomerQR(qrCode);
    } else if (this.scanMode === 'order') {
      this.scanOrderQR(qrCode);
    } else if (this.scanMode === 'shelf') {
      this.scanShelfQR(qrCode);
    }
  }

  scanCustomerQR(qrCode: string): void {
  this.warehouseService.getCustomerOrdersByQR(qrCode).subscribe({
    next: (res) => {
      if (res.success) {
        this.customerOrders = res.data;
        this.showCustomerOrdersModal = true;
        this.currentScanInput = ''; // ✅ Clear input
      } else {
        this.showToast(res.message || this.t('customer_not_found'), 'error');
      }
    },
    error: (err) => {
      this.showToast(err.error?.message || this.t('error'), 'error');
    }
  });
}

 scanOrderQR(qrCode: string): void {
  this.warehouseService.getWarehouseOrderByQR(qrCode).subscribe({
    next: (res) => {
      if (res.success) {
        this.currentOrder = res.data;
        this.scannedOrderQR = qrCode;
        this.currentScanInput = ''; // ✅ Clear input
        
        // Auto switch to shelf scan
        if (!this.currentOrder.shelfCode) {
          this.scanMode = 'shelf';
          this.showToast(this.t('scan_shelf_now'), 'info');
        } else {
          this.showToast(
            `${this.t('order_in_shelf')}: ${this.currentOrder.shelfCode}`,
            'success'
          );
        }
      } else {
        this.showToast(res.message || this.t('order_not_found'), 'error');
      }
    },
    error: (err) => {
      this.showToast(err.error?.message || this.t('error'), 'error');
    }
  });
}

scanShelfQR(qrCode: string): void {
  const shelf = this.shelves.find(s => s.qrCode === qrCode);
  
  if (!shelf) {
    this.showToast(this.t('shelf_not_found'), 'error');
    return;
  }

  this.currentShelf = shelf;
  this.scannedShelfQR = qrCode;
  this.currentScanInput = ''; // ✅ Clear input

  // If order already scanned, store it
  if (this.currentOrder && this.scannedOrderQR) {
    this.storeOrder();
  } else {
    this.showToast(this.t('scan_order_first'), 'info');
    this.scanMode = 'order';
  }
}

  storeOrder(): void {
    if (!this.scannedOrderQR || !this.scannedShelfQR) {
      this.showToast(this.t('scan_both_codes'), 'error');
      return;
    }

    const dto: StoreOrderInShelf = {
      orderQRCode: this.scannedOrderQR,
      shelfQRCode: this.scannedShelfQR,
      notes: this.notes || undefined
    };

    this.warehouseService.storeOrderInShelf(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(res.message || this.t('order_stored'), 'success');
          this.resetScan();
          this.loadData();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: (err) => {
        this.showToast(err.error?.message || this.t('error'), 'error');
      }
    });
  }

  resetScan(): void {
    this.scannedOrderQR = '';
    this.scannedShelfQR = '';
    this.currentOrder = null;
    this.currentShelf = null;
    this.notes = '';
     this.currentScanInput = '';
    this.scanMode = 'customer';
  }

  // ===== PICKUP =====

pickupOrder(orderQR: string): void {
  const dto: PickupOrder = { orderQRCode: orderQR };

  this.warehouseService.markAsPickedUp(dto).subscribe({
    next: (res) => {
      if (res.success) {
        this.showToast(this.t('order_picked_up'), 'success');
        
        // ✅ FIX 1: Update customer orders modal
        if (this.customerOrders) {
          const orderIndex = this.customerOrders.orders.findIndex(o => o.orderQRCode === orderQR);
          if (orderIndex !== -1) {
            this.customerOrders.orders[orderIndex].status = WarehouseOrderStatus.PickedUp;
          }
        }
        
        // ✅ FIX 2: Update all orders list
        const allOrderIndex = this.orders.findIndex(o => o.orderQRCode === orderQR);
        if (allOrderIndex !== -1) {
          this.orders[allOrderIndex].status = WarehouseOrderStatus.PickedUp;
          this.orders[allOrderIndex].pickedAt = new Date().toISOString();
        }
        
        this.cdr.detectChanges();
        this.closeCustomerOrdersModal();
        
        // ✅ OPTIONAL: Reload data for fresh state
        // this.loadData();
      } else {
        this.showToast(res.message || this.t('error'), 'error');
      }
    },
    error: (err) => {
      this.showToast(err.error?.message || this.t('error'), 'error');
    }
  });
}


  // ===== SEARCH =====

  performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.showToast(this.t('enter_search'), 'error');
      return;
    }

    const dto: SearchWarehouse = {
      orderNumber: this.searchType === 'order' ? this.searchQuery : undefined,
      phoneNumber: this.searchType === 'phone' ? this.searchQuery : undefined,
      qrCode: this.searchType === 'qr' ? this.searchQuery : undefined
    };

    this.warehouseService.searchWarehouse(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.searchResults = res.data;
          if (this.searchResults.length === 0) {
            this.showToast(this.t('no_results'), 'info');
          }
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: (err) => {
        this.showToast(err.error?.message || this.t('error'), 'error');
      }
    });
  }

  // ===== SHELVES =====

  openCreateShelfModal(): void {
    this.newShelf = { code: '', description: '' };
    this.showCreateShelfModal = true;
  }

  closeCreateShelfModal(): void {
    this.showCreateShelfModal = false;
  }

  createShelf(): void {
    if (!this.newShelf.code.trim()) {
      this.showToast(this.t('enter_shelf_code'), 'error');
      return;
    }

    this.warehouseService.createShelf(this.newShelf).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(res.message || this.t('shelf_created'), 'success');
          this.closeCreateShelfModal();
          this.loadData();
        } else {
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: (err) => {
        this.showToast(err.error?.message || this.t('error'), 'error');
      }
    });
  }

 deleteShelf(id: number): void {
  this.shelfToDeleteId = id;
  this.showDeleteConfirmModal = true;
}

confirmDeleteShelf(): void {
  if (!this.shelfToDeleteId) return;
  
  this.warehouseService.deleteShelf(this.shelfToDeleteId).subscribe({
    next: (res) => {
      if (res.success) {
        this.showToast(res.message || this.t('shelf_deleted'), 'success');
        this.loadData();
      } else {
        this.showToast(res.message || this.t('error'), 'error');
      }
    },
    error: (err) => {
      this.showToast(err.error?.message || this.t('error'), 'error');
    }
  });
  
  this.showDeleteConfirmModal = false;
  this.shelfToDeleteId = null;
}

cancelDeleteShelf(): void {
  this.showDeleteConfirmModal = false;
  this.shelfToDeleteId = null;
}

  // ===== MODALS =====

  closeCustomerOrdersModal(): void {
    this.showCustomerOrdersModal = false;
    this.customerOrders = null;
  }

  // ===== HELPERS =====

  getStatusBadgeClass(status: WarehouseOrderStatus): string {
    const statusMap: { [key: number]: string } = {
      0: 'created',
      1: 'on-way',
      2: 'in-warehouse',
      3: 'ready',
      4: 'picked-up'
    };
    return statusMap[status] || 'created';
  }

  getStatusText(status: WarehouseOrderStatus): string {
    const statusMap: { [key: number]: { ar: string; en: string } } = {
      [WarehouseOrderStatus.Created]: { ar: 'تم الإنشاء', en: 'Created' },
      [WarehouseOrderStatus.OnTheWayToWarehouse]: { ar: 'في الطريق للمخزن', en: 'On the Way' },
      [WarehouseOrderStatus.InWarehouse]: { ar: 'في المخزن', en: 'In Warehouse' },
      [WarehouseOrderStatus.ReadyForPickup]: { ar: 'جاهز للاستلام', en: 'Ready for Pickup' },
      [WarehouseOrderStatus.PickedUp]: { ar: 'تم الاستلام', en: 'Picked Up' }
    };

    const info = statusMap[status] || { ar: 'غير معروف', en: 'Unknown' };
    return this.i18n.currentLang === 'ar' ? info.ar : info.en;
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(
      this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  }

  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'enter_qr': { ar: 'أدخل رمز QR', en: 'Enter QR Code' },
      'customer_not_found': { ar: 'العميل غير موجود', en: 'Customer not found' },
      'order_not_found': { ar: 'الطلب غير موجود', en: 'Order not found' },
      'shelf_not_found': { ar: 'الرف غير موجود', en: 'Shelf not found' },
      'scan_shelf_now': { ar: 'امسح QR الرف الآن', en: 'Scan shelf QR now' },
      'order_in_shelf': { ar: 'الطلب موجود في الرف', en: 'Order is in shelf' },
      'scan_order_first': { ar: 'امسح الطلب أولاً', en: 'Scan order first' },
      'scan_both_codes': { ar: 'امسح QR الطلب والرف', en: 'Scan both order and shelf QR' },
      'order_stored': { ar: 'تم حفظ الطلب في الرف', en: 'Order stored in shelf' },
      'order_picked_up': { ar: 'تم تسليم الطلب للعميل', en: 'Order picked up by customer' },
      'enter_search': { ar: 'أدخل كلمة البحث', en: 'Enter search query' },
      'no_results': { ar: 'لا توجد نتائج', en: 'No results found' },
      'enter_shelf_code': { ar: 'أدخل رقم الرف', en: 'Enter shelf code' },
      'shelf_created': { ar: 'تم إنشاء الرف', en: 'Shelf created' },
      'shelf_deleted': { ar: 'تم حذف الرف', en: 'Shelf deleted' },
      'confirm_delete_shelf': { ar: 'هل تريد حذف هذا الرف؟', en: 'Delete this shelf?' },
      'error': { ar: 'حدث خطأ', en: 'An error occurred' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }
}