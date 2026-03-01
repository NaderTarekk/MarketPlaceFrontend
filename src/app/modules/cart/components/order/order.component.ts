// ═══════════════════════════════════════════════════════════════════════════
// FILE: src/app/modules/cart/components/order/order.component.ts (UPDATED)
// ═══════════════════════════════════════════════════════════════════════════

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { Governorate } from '../../../../models/governorate';
import { CreateOrderDto } from '../../../../models/order';
import { GovernorateService } from '../../../adamin/services/governorate.service';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  paymentMethod = '';
  isSubmitting = false;
  orderSuccess = false;
  orderNumber = '';
  errorMessage = '';

  // ✅ NEW: Governorates
  governorates: Governorate[] = [];
  selectedGovernorateId: number | null = null;
  shippingCost = 0;
  isLoadingGovernorates = true;

  // ✅ NEW: Promo Code (passed from cart)
  promoCode = '';
  promoDiscount = 0;

  // ✅ NEW: Cart Summary
  subtotal = 0;
  total = 0;

  form = {
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingNotes: ''
  };

  constructor(
    public i18n: I18nService,
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private governorateService: GovernorateService
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.paymentMethod = this.route.snapshot.queryParams['payment'] || 'cash';
    this.promoCode = this.route.snapshot.queryParams['promoCode'] || '';
    this.promoDiscount = parseFloat(this.route.snapshot.queryParams['promoDiscount']) || 0;
    this.subtotal = parseFloat(this.route.snapshot.queryParams['subtotal']) || 0;

    this.loadGovernorates();
  }

  loadGovernorates(): void {
    this.isLoadingGovernorates = true;
    this.governorateService.getAll(true).subscribe({
      next: (res:any) => {
        if (res.success) {
          this.governorates = res.data;
        }
        this.isLoadingGovernorates = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingGovernorates = false;
      }
    });
  }

  onGovernorateChange(): void {
    if (this.selectedGovernorateId) {
      const gov = this.governorates.find(g => g.id === this.selectedGovernorateId);
      if (gov) {
        this.shippingCost = gov.isFreeShipping ? 0 : gov.shippingCost;
        this.form.shippingCity = this.i18n.currentLang === 'ar' ? gov.nameAr : gov.nameEn;
        this.calculateTotal();
      }
    } else {
      this.shippingCost = 0;
      this.form.shippingCity = '';
      this.calculateTotal();
    }
  }

  calculateTotal(): void {
    this.total = this.subtotal + this.shippingCost - this.promoDiscount;
  }

  getGovernorateName(gov: Governorate): string {
    return this.i18n.currentLang === 'ar' ? gov.nameAr : gov.nameEn;
  }

  getShippingLabel(gov: Governorate): string {
    if (gov.isFreeShipping) {
      return this.i18n.currentLang === 'ar' ? 'مجاني' : 'Free';
    }
    return `${gov.shippingCost} ${this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP'}`;
  }

  formatPrice(price: number): string {
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP');
  }

  getPaymentLabel(): string {
    const labels: any = {
      visa: 'Visa / Mastercard',
      vodafone: 'Vodafone Cash',
      instapay: 'InstaPay',
      cash: this.i18n.currentLang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'
    };
    return labels[this.paymentMethod] || this.paymentMethod;
  }

  submitOrder(): void {
    // Validation
    if (!this.form.shippingName || !this.form.shippingPhone || !this.form.shippingAddress) {
      this.errorMessage = this.i18n.currentLang === 'ar'
        ? 'يرجى ملء جميع الحقول المطلوبة'
        : 'Please fill all required fields';
      return;
    }

    if (!this.selectedGovernorateId) {
      this.errorMessage = this.i18n.currentLang === 'ar'
        ? 'يرجى اختيار المحافظة'
        : 'Please select a governorate';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const dto: CreateOrderDto = {
      shippingName: this.form.shippingName,
      shippingPhone: this.form.shippingPhone,
      shippingAddress: this.form.shippingAddress,
      shippingCity: this.form.shippingCity || undefined,
      shippingNotes: this.form.shippingNotes || undefined,
      paymentMethod: this.paymentMethod,
      governorateId: this.selectedGovernorateId,
      promoCode: this.promoCode || undefined
    };

    this.orderService.createOrder(dto).subscribe({
      next: (res: any) => {
        if (res.success) {
          // If Visa payment, redirect to Stripe Checkout
          if (this.paymentMethod === 'visa' && res.checkoutUrl) {
            window.location.href = res.checkoutUrl;
            return;
          }

          // For other payment methods, show success
          this.orderSuccess = true;
          this.cartService.resetCartState();
          this.orderNumber = res.data.orderNumber;
        } else {
          this.errorMessage = res.message || 'Error';
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Something went wrong';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}