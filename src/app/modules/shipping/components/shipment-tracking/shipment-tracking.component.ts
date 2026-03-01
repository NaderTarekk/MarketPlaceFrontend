import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShippingService } from '../../services/shipping.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { ShipmentDetails, ShipmentStatus, VendorOrderStatus } from '../../../../models/shipping';

@Component({
  selector: 'app-shipment-tracking',
  standalone: false,  
  templateUrl: './shipment-tracking.component.html',
  styleUrl: './shipment-tracking.component.css'
})
export class ShipmentTrackingComponent implements OnInit {
  shipment: ShipmentDetails | null = null;
  isLoading = true;
  error = '';

  ShipmentStatus = ShipmentStatus;
  VendorOrderStatus = VendorOrderStatus;

  constructor(
    public i18n: I18nService,
    private route: ActivatedRoute,
    private shippingService: ShippingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const barcode = this.route.snapshot.params['barcode'];
    if (barcode) {
      this.loadShipment(barcode);
    }
  }

  loadShipment(barcode: string): void {
    this.isLoading = true;
    this.shippingService.getShipmentByBarcode(barcode).subscribe({
      next: (res) => {
        if (res.success) {
          this.shipment = res.data;
        } else {
          this.error = res.message || this.t('not_found');
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = this.t('error_loading');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTrackingSteps(): { label: string; icon: string; status: 'completed' | 'active' | 'pending' }[] {
    if (!this.shipment) return [];

    const currentStatus = this.shipment.status;

    const steps = [
      { 
        label: this.i18n.currentLang === 'ar' ? 'تم استلام الطلب' : 'Order Received', 
        icon: 'fa-clipboard-check',
        status: currentStatus >= ShipmentStatus.Pending ? 'completed' : 'pending'
      },
      { 
        label: this.i18n.currentLang === 'ar' ? 'جاري التجهيز' : 'Processing', 
        icon: 'fa-box',
        status: currentStatus >= ShipmentStatus.Processing ? 'completed' : 
                currentStatus === ShipmentStatus.Pending ? 'pending' : 'active'
      },
      { 
        label: this.i18n.currentLang === 'ar' ? 'جاهز للاستلام/التوصيل' : 'Ready', 
        icon: 'fa-warehouse',
        status: currentStatus >= ShipmentStatus.ReadyForPickup ? 'completed' : 
                currentStatus >= ShipmentStatus.PartiallyPicked ? 'active' : 'pending'
      },
      { 
        label: this.i18n.currentLang === 'ar' ? 'في الطريق' : 'Out for Delivery', 
        icon: 'fa-truck',
        status: currentStatus >= ShipmentStatus.OutForDelivery ? 'completed' : 
                currentStatus === ShipmentStatus.ReadyForPickup ? 'active' : 'pending'
      },
      { 
        label: this.i18n.currentLang === 'ar' ? 'تم التوصيل' : 'Delivered', 
        icon: 'fa-circle-check',
        status: currentStatus === ShipmentStatus.Delivered ? 'completed' : 'pending'
      }
    ];

    return steps as any;
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'not_found': { ar: 'الشحنة غير موجودة', en: 'Shipment not found' },
      'error_loading': { ar: 'خطأ في تحميل البيانات', en: 'Error loading data' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }
}