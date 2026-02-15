import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CreateOrderDto } from '../../../../models/order';
import { CartService } from '../../services/cart.service';

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
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.paymentMethod = this.route.snapshot.queryParams['payment'] || 'cash';
    console.log('🔹 Payment Method:', this.paymentMethod); // Debug log
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
    console.log('🔹 Submit Order Called'); // Debug log

    if (!this.form.shippingName || !this.form.shippingPhone || !this.form.shippingAddress) {
      this.errorMessage = this.i18n.currentLang === 'ar'
        ? 'يرجى ملء جميع الحقول المطلوبة'
        : 'Please fill all required fields';
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
      paymentMethod: this.paymentMethod
    };

    console.log('🔹 Sending DTO:', dto); // Debug log

    this.orderService.createOrder(dto).subscribe({
      next: (res: any) => {
        console.log('🔹 Response:', res); // Debug log

        if (res.success) {
          // If Visa payment, redirect to Stripe Checkout
          if (this.paymentMethod === 'visa' && res.checkoutUrl) {
            console.log('🔹 Redirecting to Stripe:', res.checkoutUrl); // Debug log
            // Redirect to Stripe Checkout page
            window.location.href = res.checkoutUrl;
            return;
          }

          // For other payment methods (cash, vodafone, instapay), show success
          this.orderSuccess = true;
          this.cartService.resetCartState();
          this.orderNumber = res.data.orderNumber;
          console.log('🔹 Order Success:', this.orderNumber); // Debug log
        } else {
          this.errorMessage = res.message || 'Error';
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('🔴 Error:', err); // Debug log
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