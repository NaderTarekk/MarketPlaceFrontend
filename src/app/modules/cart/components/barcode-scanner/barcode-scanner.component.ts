// ═══════════════════════════════════════════════════════════════════════════
// 1. barcode-scanner.component.ts
// ═══════════════════════════════════════════════════════════════════════════

import { Component, ChangeDetectorRef } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-barcode-scanner',
  standalone: false,
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.css'
})
export class BarcodeScannerComponent {
  orderNumber = '';
  isScanning = false;
  orderDetails: any = null;
  errorMessage = '';

  constructor(
    public i18n: I18nService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  scanBarcode(): void {
    if (!this.orderNumber.trim()) {
      this.errorMessage = this.i18n.currentLang === 'ar' 
        ? 'أدخل رقم الطلب' 
        : 'Enter order number';
      return;
    }

    this.isScanning = true;
    this.errorMessage = '';
    this.orderDetails = null;

    this.orderService.scanOrderBarcode(this.orderNumber.trim()).subscribe({
      next: (res) => {
        if (res.success) {
          this.orderDetails = res.data;
        } else {
          this.errorMessage = res.message || 'Order not found';
        }
        this.isScanning = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error scanning barcode';
        this.isScanning = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearSearch(): void {
    this.orderNumber = '';
    this.orderDetails = null;
    this.errorMessage = '';
  }

  getImageUrl(image: string | null): string {
    if (!image) return 'assets/images/placeholder.svg';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  getQRCodeUrl(path: string | null): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.baseApi}${path}`;
  }

  formatPrice(price: number): string {
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(
      this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  }

  getStatusBadge(status: string): { text: string; class: string } {
    const statusMap: { [key: string]: { ar: string; en: string; class: string } } = {
      'Pending': { ar: 'قيد الانتظار', en: 'Pending', class: 'pending' },
      'Processing': { ar: 'قيد المعالجة', en: 'Processing', class: 'processing' },
      'Confirmed': { ar: 'مؤكد', en: 'Confirmed', class: 'confirmed' },
      'Shipped': { ar: 'تم الشحن', en: 'Shipped', class: 'shipped' },
      'OutForDelivery': { ar: 'في الطريق', en: 'Out for Delivery', class: 'out-for-delivery' },
      'Delivered': { ar: 'تم التوصيل', en: 'Delivered', class: 'delivered' },
      'Cancelled': { ar: 'ملغي', en: 'Cancelled', class: 'cancelled' }
    };
    const s = statusMap[status] || { ar: status, en: status, class: '' };
    return { text: this.i18n.currentLang === 'ar' ? s.ar : s.en, class: s.class };
  }

  getPaymentStatusBadge(status: string): { text: string; class: string } {
    const statusMap: { [key: string]: { ar: string; en: string; class: string } } = {
      'Pending': { ar: 'قيد الانتظار', en: 'Pending', class: 'pending' },
      'Paid': { ar: 'مدفوع', en: 'Paid', class: 'paid' },
      'Failed': { ar: 'فشل', en: 'Failed', class: 'failed' },
      'Refunded': { ar: 'مسترد', en: 'Refunded', class: 'refunded' }
    };
    const s = statusMap[status] || { ar: status, en: status, class: '' };
    return { text: this.i18n.currentLang === 'ar' ? s.ar : s.en, class: s.class };
  }

  printOrder(): void {
    window.print();
  }
}