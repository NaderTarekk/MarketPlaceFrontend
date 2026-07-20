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
import { UserAddress, CreateAddressDto } from '../../../../models/address';
import { AddressServiceService } from '../../../auth/services/address-service.service';
import { environment } from '../../../../../environment';
import { PickupPointService } from '../../../../services/pickup-point.service';
import { PickupPoint } from '../../../../models/pickup-point';
import * as L from 'leaflet';

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

  isProcessing = false;
  shipping = 0;

  // ✅ أضف الـ instructionsModal:
  instructionsModal = {
    show: false,
    title: '',
    content: '',
    orderNumber: ''
  };

  // qrcode
  orderQRCodePath = '';

  // ✅ أضف الـ toast:
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // ✅ NEW: Cart Summary
  subtotal = 0;
  total = 0;

  // vendor
  vendorPhone: string = '';
  vendorName: string = '';

  deliveryType = 0;
  deliveryTypes = [
    { value: 0, labelAr: 'استلام من المخزن', labelEn: 'Pickup from Warehouse', icon: 'fa-warehouse' },
    { value: 1, labelAr: 'توصيل للمنزل', labelEn: 'Home Delivery', icon: 'fa-home' }
  ];
  isPickupAvailable = true;
  vodafoneCashNumber = '';
  vodafoneCashName = '';
  vodafoneCashNote = '';
  instaPayHandle = '';
  instaPayName = '';
  instaPayNote = '';
  bankName = '';
  bankAccountHolder = '';
  bankAccountNumber = '';
  bankIBAN = '';
  bankNote = '';
  cashOnDeliveryEnabled = true;
  vodafoneCashEnabled = true;
  instaPayEnabled = true;
  bankEnabled = true;
  isDetectingLocation = false;

  // Pickup Points
  pickupGovernorates: any[] = [];
  pickupPoints: PickupPoint[] = [];
  selectedPickupGovernorateId: number | null = null;
  selectedPickupPoint: PickupPoint | null = null;
  showPickupMap = false;
  private pickupMap: L.Map | null = null;

  paymentMethods = [
    {
      id: 'cash',
      nameAr: 'الدفع عند الاستلام',
      nameEn: 'Cash on Delivery',
      icon: 'fa-solid fa-money-bill-wave',
      color: '#059669'
    },
    {
      id: 'vodafone',
      nameAr: 'فودافون كاش',
      nameEn: 'Vodafone Cash',
      icon: 'fa-solid fa-mobile-screen-button',
      color: '#e60000'
    },
    {
      id: 'instapay',
      nameAr: 'إنستا باي',
      nameEn: 'InstaPay',
      icon: 'fa-solid fa-bolt',
      color: '#7c3aed'
    },
    {
      id: 'bank',
      nameAr: 'تحويل بنكي',
      nameEn: 'Bank Transfer',
      icon: 'fa-solid fa-building-columns',
      color: '#0369a1'
    }
  ];
  selectedPaymentMethod: string = '';

  // Payment method info visibility
  showVodafoneInfo: boolean = false;
  showInstapayInfo: boolean = false;
  showBankInfo: boolean = false;

  form = {
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingNotes: ''
  };

  // ✅ NEW: Address Management
  addresses: UserAddress[] = [];
  isLoadingAddresses = false;
  selectedAddressId: number | null = null;
  showAddressDialog = false;
  showAddNewAddressDialog = false;
  isEditingAddress = false;
  addressToEdit: UserAddress | null = null;
  isSavingAddress = false;

  addressForm: CreateAddressDto = {
    label: 'Home',
    fullName: '',
    phoneNumber: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Egypt',
    isDefault: false
  };


  constructor(
    public i18n: I18nService,
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private governorateService: GovernorateService,
    private addressService: AddressServiceService,
    private pickupPointService: PickupPointService
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
    this.loadAddresses();
    this.loadSiteSettings();
    this.loadPickupGovernorates();
  }

  loadSiteSettings(): void {
    this.orderService.getSiteSettings().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.isPickupAvailable = res.data.isPickupAvailable ?? true;
          if (!this.isPickupAvailable && this.deliveryType === 0) {
            this.deliveryType = 1;
          }
          this.vodafoneCashNumber = res.data.vodafoneCashNumber || '';
          this.vodafoneCashName = res.data.vodafoneCashName || '';
          this.vodafoneCashNote = res.data.vodafoneCashNote || '';
          this.instaPayHandle = res.data.instaPayHandle || '';
          this.instaPayName = res.data.instaPayName || '';
          this.instaPayNote = res.data.instaPayNote || '';
          this.bankName = res.data.bankName || '';
          this.bankAccountHolder = res.data.bankAccountHolder || '';
          this.bankAccountNumber = res.data.bankAccountNumber || '';
          this.bankIBAN = res.data.bankIBAN || '';
          this.bankNote = res.data.bankNote || '';
          this.cashOnDeliveryEnabled = res.data.cashOnDeliveryEnabled ?? true;
          this.vodafoneCashEnabled = res.data.vodafoneCashEnabled ?? true;
          this.instaPayEnabled = res.data.instaPayEnabled ?? true;
          this.bankEnabled = res.data.bankEnabled ?? true;
        }
      },
      error: () => { /* keep defaults: pickup open */ }
    });
  }

  detectLocation(): void {
    if (!navigator.geolocation) return;
    this.isDetectingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(r => r.json())
          .then((data: any) => {
            const addr = data.address;
            const parts = [addr.road, addr.suburb, addr.city_district, addr.city, addr.state].filter(Boolean);
            this.form.shippingAddress = parts.join(', ');
            this.isDetectingLocation = false;
            this.cdr.detectChanges();
          })
          .catch(() => { this.isDetectingLocation = false; });
      },
      () => { this.isDetectingLocation = false; }
    );
  }

  loadGovernorates(): void {
    this.isLoadingGovernorates = true;
    this.governorateService.getAll(true).subscribe({
      next: (res: any) => {
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
        this.form.shippingCity = this.i18n.currentLang === 'ar' ? gov.nameAr : gov.nameEn;
        this.updateShippingCost(gov);
      }
    } else {
      this.shippingCost = 0;
      this.shipping = 0;
      this.form.shippingCity = '';
      this.calculateTotal();
    }
  }

  onDeliveryTypeChange(): void {
    if (this.deliveryType === 0) {
      this.loadPickupGovernorates();
      this.selectedPickupPoint = null;
      this.showPickupMap = false;
      this.destroyPickupMap();
    }
    if (this.selectedGovernorateId) {
      const gov = this.governorates.find(g => g.id === this.selectedGovernorateId);
      if (gov) {
        this.updateShippingCost(gov);
        return;
      }
    }
    this.shippingCost = 0;
    this.shipping = 0;
    this.calculateTotal();
  }

  private updateShippingCost(gov: Governorate): void {
    if (this.deliveryType === 0) {
      // Warehouse pickup is always free
      this.shippingCost = 0;
    } else {
      this.shippingCost = gov.isFreeShipping ? 0 : gov.shippingCost;
    }
    this.shipping = this.shippingCost;
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total = this.subtotal + this.shipping - this.promoDiscount;
  }

  getGovernorateName(gov: Governorate): string {
    return this.i18n.currentLang === 'ar' ? gov.nameAr : gov.nameEn;
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;
    this.showVodafoneInfo = methodId === 'vodafone';
    this.showInstapayInfo = methodId === 'instapay';
    this.showBankInfo = methodId === 'bank';
  }

  get canCheckout(): boolean {
    if (!this.selectedPaymentMethod || this.isProcessing) return false;
    if (!this.form.shippingName?.trim() || !this.form.shippingPhone?.trim() || !this.form.shippingAddress?.trim()) return false;
    if (this.deliveryType === 0) {
      if (!this.isPickupAvailable) return false;
      if (!this.selectedPickupPoint) return false;
    } else if (this.deliveryType === 1) {
      if (!this.selectedGovernorateId) return false;
    }
    return true;
  }

  get visiblePaymentMethods() {
    const enabledMap: { [k: string]: boolean } = {
      cash: this.cashOnDeliveryEnabled,
      vodafone: this.vodafoneCashEnabled,
      instapay: this.instaPayEnabled,
      bank: this.bankEnabled
    };
    return this.paymentMethods.filter(m => enabledMap[m.id] !== false);
  }

  copyToClipboard(text: string): void {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(
      () => this.showToast(this.i18n.currentLang === 'ar' ? 'تم النسخ' : 'Copied', 'success'),
      () => { }
    );
  }


  proceedToPayment(): void {
    // Validation
    if (!this.form.shippingName || !this.form.shippingPhone || !this.form.shippingAddress) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'املأ جميع الحقول المطلوبة' : 'Fill all required fields',
        'error'
      );
      return;
    }

    if (this.deliveryType === 0) {
      if (!this.isPickupAvailable) {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'اختر نوع التوصيل — نقطة الاستلام مغلقة مؤقتاً' : 'Select delivery type — pickup is temporarily closed',
          'error'
        );
        return;
      }
      if (!this.selectedPickupPoint) {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'اختر نقطة الاستلام' : 'Select a pickup point',
          'error'
        );
        return;
      }
    } else if (this.deliveryType === 1) {
      if (!this.selectedGovernorateId) {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'اختر المحافظة' : 'Select governorate',
          'error'
        );
        return;
      }
    }

    if (!this.selectedPaymentMethod) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'اختر طريقة الدفع' : 'Select payment method',
        'error'
      );
      return;
    }

    this.isProcessing = true;

    const dto: any = {
      shippingName: this.form.shippingName.trim(),
      shippingPhone: this.form.shippingPhone.trim(),
      shippingAddress: this.form.shippingAddress.trim(),
      shippingCity: this.form.shippingCity?.trim() || '',
      governorateId: this.selectedGovernorateId,
      deliveryType: this.deliveryType,
      paymentMethod: this.mapPaymentMethod(this.selectedPaymentMethod)
    };

    if (this.deliveryType === 0 && this.selectedPickupPoint) {
      dto.pickupPointId = this.selectedPickupPoint.id;
    }

    if (this.form.shippingNotes?.trim()) {
      dto.shippingNotes = this.form.shippingNotes.trim();
    }

    if (this.promoCode?.trim()) {
      dto.promoCode = this.promoCode.trim();
    }

    console.log('📤 Sending DTO:', dto);

    this.orderService.createOrder(dto).subscribe({
      next: (res) => {
        console.log('✅ Response:', res);

        this.isProcessing = false; // ✅ Stop loading FIRST

        if (res.success) {
          // ✅ Clear cart
          this.cartService.resetCartState();

          // ✅ Store QR Code path
          this.orderQRCodePath = res.data?.qrCodePath || '';

          // If Visa, redirect to Stripe
          if (this.selectedPaymentMethod === 'visa' && res.data?.checkoutUrl) {
            window.location.href = res.data.checkoutUrl;
            return;
          }

          // If Vodafone/InstaPay/Bank, show instructions
          if (this.selectedPaymentMethod === 'vodafone') {
            this.showVodafoneInstructions(res.data?.orderNumber || 'N/A');
          } else if (this.selectedPaymentMethod === 'instapay') {
            this.showInstapayInstructions(res.data?.orderNumber || 'N/A');
          } else if (this.selectedPaymentMethod === 'bank') {
            this.showBankInstructions(res.data?.orderNumber || 'N/A');
          } else {
            // ✅ Cash on Delivery - show success
            this.orderSuccess = true;
            this.orderNumber = res.data?.orderNumber || 'N/A';
          }

          this.cdr.detectChanges(); // ✅ Force UI update
        } else {
          this.showToast(res.message || 'Error', 'error');
        }
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.isProcessing = false;
        this.showToast(err.error?.message || 'Error creating order', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  getQRCodeUrl(path: string | null): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.baseApi}${path}`;
  }

  downloadQRCode(): void {
    if (!this.orderQRCodePath) return;

    const link = document.createElement('a');
    link.href = this.getQRCodeUrl(this.orderQRCodePath);
    link.download = `${this.orderNumber}-QR.png`;
    link.click();
  }

  printQRCode(): void {
    window.print();
  }

  mapPaymentMethod(method: string): string {
    const mapping: any = {
      'visa': 'CreditCard',
      'vodafone': 'VodafoneCash',
      'instapay': 'InstaPay',
      'bank': 'BankTransfer',
      'cash': 'CashOnDelivery'
    };
    return mapping[method] || 'CashOnDelivery';
  }

  initiateStripePayment(): void {
    this.isProcessing = true;
    this.orderService.createStripeSession(this.getOrderData()).subscribe({
      next: (res) => {
        if (res.success && res.data.sessionUrl) {
          window.location.href = res.data.sessionUrl;
        } else {
          this.showToast(res.message || 'Error', 'error');
          this.isProcessing = false;
        }
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isProcessing = false;
      }
    });
  }

  placeOrderWithCOD(): void {
    this.isProcessing = true;

    const orderData = {
      ...this.getOrderData(),
      paymentMethod: 'CashOnDelivery'
    };

    this.orderService.placeOrder(orderData).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/order-success'], {
            queryParams: { orderNumber: res.data.orderNumber }
          });
        } else {
          this.showToast(res.message || 'Error', 'error');
        }
        this.isProcessing = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isProcessing = false;
      }
    });
  }

  get purposeText(): string {
    return this.instructionsModal.orderNumber ? `Order-${this.instructionsModal.orderNumber}` : '';
  }

  showVodafoneInstructions(orderNumber: string): void {
    const num = this.vodafoneCashNumber || '01116770933';
    const name = this.vodafoneCashName || '';
    const waLink = 'https://wa.me/2' + num.replace(/^0/, '');
    const isAr = this.i18n.currentLang === 'ar';
    this.instructionsModal = {
      show: true,
      title: isAr ? 'تعليمات الدفع - فودافون كاش' : 'Payment Instructions - Vodafone Cash',
      content: (isAr
        ? `<p>لإتمام الدفع عبر فودافون كاش:</p><ol>
            <li>افتح تطبيق فودافون كاش</li>
            <li>اختر "تحويل أموال"</li>
            <li>أدخل الرقم: <strong>${num}</strong> ${name ? '(' + name + ')' : ''}</li>
            <li>أدخل المبلغ: <strong>${this.total} ج.م</strong></li>
            <li>خذ لقطة شاشة للإيصال</li>
            <li>أرسل على واتساب: <a href="${waLink}" target="_blank" style="color:#25d366"><strong>${num}</strong></a></li>
            <li>اذكر رقم الطلب: <strong>${orderNumber}</strong></li></ol>`
        : `<p>Complete payment via Vodafone Cash:</p><ol>
            <li>Open Vodafone Cash app</li>
            <li>Select "Transfer Money"</li>
            <li>Enter number: <strong>${num}</strong> ${name ? '(' + name + ')' : ''}</li>
            <li>Enter amount: <strong>${this.total} EGP</strong></li>
            <li>Take a screenshot of the receipt</li>
            <li>Send on WhatsApp: <a href="${waLink}" target="_blank" style="color:#25d366"><strong>${num}</strong></a></li>
            <li>Mention order number: <strong>${orderNumber}</strong></li></ol>`),
      orderNumber
    };
  }

  showInstapayInstructions(orderNumber: string): void {
    const isAr = this.i18n.currentLang === 'ar';
    const handle = this.instaPayHandle || '';
    const name = this.instaPayName || '';
    this.instructionsModal = {
      show: true,
      title: isAr ? 'تعليمات الدفع - إنستا باي' : 'Payment Instructions - InstaPay',
      content: (isAr
        ? `<p>لإتمام الدفع عبر إنستا باي:</p>
          <ol>
            <li>افتح تطبيق البنك أو تطبيق InstaPay</li>
            <li>اختر "تحويل InstaPay"</li>
            <li>أدخل الحساب: <strong>${handle || '—'}</strong> ${name ? '(' + name + ')' : ''}</li>
            <li>أدخل المبلغ: <strong>${this.total} ج.م</strong></li>
            <li>اكتب في خانة الغرض/الوصف الغرض الموجود بالأسفل</li>
            <li>خذ لقطة شاشة للإيصال وأرسلها لخدمة العملاء</li>
          </ol>`
        : `<p>Complete payment via InstaPay:</p>
          <ol>
            <li>Open your bank / InstaPay app</li>
            <li>Select "InstaPay Transfer"</li>
            <li>Enter handle: <strong>${handle || '—'}</strong> ${name ? '(' + name + ')' : ''}</li>
            <li>Enter amount: <strong>${this.total} EGP</strong></li>
            <li>Write the purpose shown below in the reference/purpose field</li>
            <li>Take a screenshot and send to customer service</li>
          </ol>`),
      orderNumber
    };
  }

  showBankInstructions(orderNumber: string): void {
    const isAr = this.i18n.currentLang === 'ar';
    this.instructionsModal = {
      show: true,
      title: isAr ? 'تعليمات الدفع - تحويل بنكي' : 'Payment Instructions - Bank Transfer',
      content: (isAr
        ? `<p>حوّل المبلغ على الحساب التالي:</p>
          <ul style="list-style:none;padding:0;line-height:1.9">
            <li><strong>اسم البنك:</strong> ${this.bankName || '—'}</li>
            <li><strong>اسم صاحب الحساب:</strong> ${this.bankAccountHolder || '—'}</li>
            <li><strong>رقم الحساب:</strong> ${this.bankAccountNumber || '—'}</li>
            ${this.bankIBAN ? `<li><strong>IBAN:</strong> ${this.bankIBAN}</li>` : ''}
            <li><strong>المبلغ:</strong> ${this.total} ج.م</li>
          </ul>
          <p style="margin-top:8px">اكتب في خانة "الغرض/سبب التحويل" النص الموجود بالأسفل وأرسل صورة الإيصال لخدمة العملاء.</p>`
        : `<p>Transfer the amount to the following account:</p>
          <ul style="list-style:none;padding:0;line-height:1.9">
            <li><strong>Bank:</strong> ${this.bankName || '—'}</li>
            <li><strong>Account holder:</strong> ${this.bankAccountHolder || '—'}</li>
            <li><strong>Account number:</strong> ${this.bankAccountNumber || '—'}</li>
            ${this.bankIBAN ? `<li><strong>IBAN:</strong> ${this.bankIBAN}</li>` : ''}
            <li><strong>Amount:</strong> ${this.total} EGP</li>
          </ul>
          <p style="margin-top:8px">In the "Purpose/Reference" field write the text shown below, then send the receipt to customer service.</p>`),
      orderNumber
    };
  }

  getOrderData() {
    return {
      shippingName: this.form.shippingName,
      shippingPhone: this.form.shippingPhone,
      shippingAddress: this.form.shippingAddress,
      shippingCity: this.form.shippingCity,
      shippingNotes: this.form.shippingNotes,
      governorateId: this.selectedGovernorateId,
      promoCode: this.promoCode || undefined,
      deliveryType: this.deliveryType
    };
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
      promoCode: this.promoCode || undefined,
      deliveryType: this.deliveryType
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
    this.router.navigate(['/cart/my-orders']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  closeInstructionsModal(): void {
    this.instructionsModal.show = false;
  }

  openWhatsApp(): void {
    window.open('https://wa.me/201116770933', '_blank');
  }

  // ✅ Load Saved Addresses
  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.addressService.getAddresses().subscribe({
      next: (res) => {
        if (res.success) {
          this.addresses = res.data;

          // ✅ Auto-select default address
          const defaultAddress = this.addresses.find(a => a.isDefault);
          if (defaultAddress) {
            this.selectAddress(defaultAddress);
          }
        }
        this.isLoadingAddresses = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAddresses = false;
      }
    });
  }

  // ✅ Select Existing Address
  selectAddress(address: UserAddress): void {
    this.selectedAddressId = address.id;

    // Fill form with selected address
    this.form.shippingName = address.fullName;
    this.form.shippingPhone = address.phoneNumber;
    this.form.shippingAddress = address.addressLine;
    this.form.shippingCity = address.city;

    // ✅ FIX: Find governorate WITHOUT calling onGovernorateChange() yet
    const matchingGov = this.governorates.find(g =>
      g.nameAr === address.city || g.nameEn === address.city
    );

    if (matchingGov) {
      this.selectedGovernorateId = matchingGov.id;

      // ✅ Calculate shipping cost directly (don't trigger change event)
      this.shippingCost = matchingGov.isFreeShipping ? 0 : matchingGov.shippingCost;
      this.shipping = this.shippingCost;
      this.calculateTotal();
    } else {
      // ✅ If no matching governorate found, reset
      this.selectedGovernorateId = null;
      this.shippingCost = 0;
      this.shipping = 0;
      this.calculateTotal();
    }

    // ✅ Close dialog
    this.showAddressDialog = false;
    document.body.style.overflow = '';

    // ✅ Force UI update
    this.cdr.detectChanges();
  }

  // ✅ Open Address Selection Dialog
  openAddressSelectionDialog(): void {
    this.showAddressDialog = true;
    document.body.style.overflow = 'hidden';
  }

  // ✅ Close Address Selection Dialog
  closeAddressSelectionDialog(): void {
    this.showAddressDialog = false;
    document.body.style.overflow = '';
  }

  // ✅ Open Add New Address Dialog
  openAddNewAddressDialog(): void {
    this.isEditingAddress = false;
    this.addressToEdit = null;
    this.resetAddressForm();
    this.showAddNewAddressDialog = true;
    this.showAddressDialog = false;
    document.body.style.overflow = 'hidden';
  }

  // ✅ Close Add New Address Dialog
  closeAddNewAddressDialog(): void {
    this.showAddNewAddressDialog = false;
    this.resetAddressForm();
    document.body.style.overflow = '';
  }

  // ✅ Reset Address Form
  resetAddressForm(): void {
    this.addressForm = {
      label: 'Home',
      fullName: '',
      phoneNumber: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Egypt',
      isDefault: false
    };
  }

  // ✅ Save New Address
  saveNewAddress(): void {
    if (!this.validateAddressForm()) return;

    this.isSavingAddress = true;

    this.addressService.createAddress(this.addressForm).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم إضافة العنوان' : 'Address added',
            'success'
          );
          this.loadAddresses();
          this.closeAddNewAddressDialog();

          // Auto-select the new address
          setTimeout(() => {
            if (res.data) {
              this.selectAddress(res.data);
            }
          }, 500);
        }
        this.isSavingAddress = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isSavingAddress = false;
      }
    });
  }

  // ✅ Validate Address Form
  validateAddressForm(): boolean {
    if (!this.addressForm.fullName || !this.addressForm.phoneNumber ||
      !this.addressForm.addressLine || !this.addressForm.city) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'املأ جميع الحقول المطلوبة' : 'Fill all required fields',
        'error'
      );
      return false;
    }
    return true;
  }

  // ✅ Get Address Label Icon
  getAddressLabelIcon(label: string): string {
    const icons: { [key: string]: string } = {
      'Home': 'fa-home',
      'Work': 'fa-briefcase',
      'Other': 'fa-location-dot'
    };
    return icons[label] || 'fa-location-dot';
  }

  // ✅ Enter Address Manually
  enterManually(): void {
    this.selectedAddressId = null;
    this.form.shippingName = '';
    this.form.shippingPhone = '';
    this.form.shippingAddress = '';
    this.form.shippingCity = '';
    this.selectedGovernorateId = null;
    this.shippingCost = 0;
    this.shipping = 0;
    this.closeAddressSelectionDialog();
  }

  getSelectedAddress(): UserAddress | null {
    if (!this.selectedAddressId || !this.addresses.length) {
      return null;
    }
    return this.addresses.find(a => a.id === this.selectedAddressId) || null;
  }

  // ═══════════════════════════════════════════════
  // PICKUP POINTS
  // ═══════════════════════════════════════════════

  loadPickupGovernorates(): void {
    this.pickupPointService.getGovernoratesWithPoints().subscribe({
      next: (res: any) => {
        if (res.success) this.pickupGovernorates = res.data;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  onPickupGovernorateChange(govId: number): void {
    this.selectedPickupGovernorateId = govId;
    this.selectedPickupPoint = null;
    this.pickupPointService.getByGovernorate(govId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pickupPoints = res.data;
          this.showPickupMap = true;
          this.cdr.detectChanges();
          setTimeout(() => this.initPickupMap(), 300);
        }
      }
    });
  }

  selectPickupPoint(point: PickupPoint): void {
    this.selectedPickupPoint = point;
    this.cdr.detectChanges();
  }

  private fixLeafletIcons(): void {
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
  }

  private initPickupMap(): void {
    this.fixLeafletIcons();
    if (this.pickupMap) { this.pickupMap.remove(); this.pickupMap = null; }
    const el = document.getElementById('customerPickupMap');
    if (!el || this.pickupPoints.length === 0) return;

    this.pickupMap = L.map(el).setView([this.pickupPoints[0].latitude, this.pickupPoints[0].longitude], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.pickupMap);

    const bounds = L.latLngBounds([]);
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

    this.pickupPoints.forEach(point => {
      const name = this.i18n.currentLang === 'ar' ? point.nameAr : point.nameEn;
      const addr = this.i18n.currentLang === 'ar' ? point.addressAr : point.addressEn;
      const btnText = this.i18n.currentLang === 'ar' ? 'اختيار هذه النقطة' : 'Select this point';
      const marker = L.marker([point.latitude, point.longitude]).addTo(this.pickupMap!);
      marker.bindPopup(`<b>${name}</b><br>${addr}<br><button onclick="window.dispatchEvent(new CustomEvent('selectPickup', {detail: ${point.id}}))" style="margin-top:8px;padding:6px 14px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;width:100%">${btnText}</button>`);
      bounds.extend([point.latitude, point.longitude]);
    });

    this.pickupMap.fitBounds(bounds, { padding: [30, 30] });
    setTimeout(() => this.pickupMap?.invalidateSize(), 200);

    // Listen for pickup selection from popup button
    window.addEventListener('selectPickup', ((e: CustomEvent) => {
      const point = this.pickupPoints.find(p => p.id === e.detail);
      if (point) this.selectPickupPoint(point);
    }) as EventListener);
  }

  destroyPickupMap(): void {
    if (this.pickupMap) { this.pickupMap.remove(); this.pickupMap = null; }
  }
}