// vendor-dashboard.component.ts - COMPLETE UPDATE

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RecentOrder, SalesReport, VendorDashboard } from '../../../../models/vendor';
import { ProductFilter, ProductList, ProductVariant } from '../../../../models/products';
import { Category } from '../../../../models/category';
import { Brand } from '../../../../models/brand';
import { I18nService } from '../../../../core/services/i18n.service';
import { VendorService } from '../../services/vendor.service';
import { ProductsService } from '../../../products/services/products.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environment';
import { OrderService } from '../../../cart/services/order.service';

@Component({
  selector: 'app-vendor',
  standalone: false,
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.css',
})
export class VendorDashboardComponent implements OnInit {
  // ═══════════════════════════════════════════════
  // FINANCIAL DATA - NEW
  // ═══════════════════════════════════════════════

  // Total revenue from all orders
  totalRevenue = 0;

  // Commission rate (from user profile or default 10%)
  commissionRate = 10;

  // Total commission amount deducted
  totalCommission = 0;

  // Net profit (revenue - commission)
  confirmedProfit = 0;

  // Pending profit (from orders not yet delivered)
  pendingProfit = 0;

  // Total profit (confirmed + pending)
  totalProfit = 0;

  // Dashboard Data
  dashboard: VendorDashboard | null = null;
  isLoadingDashboard = true;
  VendorOrderStatus = {
    Pending: 0,
    Assigned: 1,
    PickedFromVendor: 2,
    InWarehouse: 3,
    OutForDelivery: 4,
    Delivered: 5,
    Cancelled: 6
  };
  Math = Math;

  // Products
  products: ProductList[] = [];
  isLoadingProducts = true;
  filter: ProductFilter = {
    page: 1,
    pageSize: 8,
    sortBy: 'newest',
    sortDesc: true
  };
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  hasPrev = false;
  hasNext = false;

  // Categories & Brands
  categories: Category[] = [];
  brands: Brand[] = [];

  // Active Tab
  activeTab: 'overview' | 'products' | 'orders' | 'reports' = 'overview';

  // Product Status Filter
  statusFilter: number | null = null;
  statusOptions = [
    { value: null, label: { ar: 'الكل', en: 'All' } },
    { value: 0, label: { ar: 'قيد المراجعة', en: 'Pending' } },
    { value: 1, label: { ar: 'مقبول', en: 'Approved' } },
    { value: 2, label: { ar: 'مرفوض', en: 'Rejected' } }
  ];

  // Sales Report
  salesReport: SalesReport[] = [];
  reportPeriod: '7d' | '30d' | '90d' | 'custom' = '30d';
  customDateFrom: string = '';
  customDateTo: string = '';

  // Product Form Dialog
  showProductDialog = false;
  isEditMode = false;
  selectedProduct: ProductList | null = null;
  productForm = {
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: 0,
    originalPrice: null as number | null,
    costPrice: null as number | null,
    stock: 0,
    lowStockThreshold: 5,
    categoryId: null as number | null,
    brandId: null as number | null,
    isFeatured: false,
    mainImage: '',
    isActive: true,
    images: [] as string[],
    hasVariants: false,
    variants: [] as ProductVariant[]
  };
  selectedMainImage: File | null = null;
  selectedImages: File[] = [];
  mainImagePreview: string | null = null;
  imagesPreview: string[] = [];
  isSubmitting = false;

  // Delete Dialog
  showDeleteDialog = false;
  productToDelete: ProductList | null = null;
  isDeleting = false;

  recentOrders: RecentOrder[] = [];

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // Order Details Modal
  selectedOrderId: number | null = null;
  showOrderModal = false;
  orderDetails: any = null;
  isLoadingOrder = false;
  isUpdatingStatus = false;

  // Cancel Order Modal
  showCancelModal = false;
  cancelOrderId: number | null = null;
  cancelReason = '';
  isCancelling = false;

  // 3. Net Profit (الإيرادات - العمولة)
  netProfit = 0;

  // 4. In-Transit Revenue (طلبات خرجت من التاجر لكن لم تُسلّم للعميل)
  inTransitRevenue = 0;

  // 5. Pending Clearance (تم التسليم لكن داخل فترة التقييد)
  pendingClearance = 0;

  // 6. Available Balance (ربح متاح للسحب)
  availableBalance = 0;

  // 7. Pending Withdrawal (مبالغ طلب سحبها ولم تُحوّل بعد)
  pendingWithdrawal = 0;

  // 8. Withdrawn (إجمالي المبالغ المسحوبة فعلياً)
  totalWithdrawn = 0;

  // Clearance period in days (يجي من الـ backend أو ثابت)
  clearancePeriodDays = 3;

  constructor(
    public i18n: I18nService,
    private vendorService: VendorService,
    private productsService: ProductsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private orderService: OrderService,
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
    this.loadSalesReport();
  }

  // ═══════════════════════════════════════════════
  // FINANCIAL CALCULATIONS - NEW
  // ═══════════════════════════════════════════════

  calculateFinancials(): void {
    if (!this.dashboard || !this.dashboard.recentOrders) {
      this.resetFinancials();
      return;
    }

    this.commissionRate = this.dashboard.commissionRate || 10;

    // Reset values
    this.totalRevenue = 0;
    this.inTransitRevenue = 0;
    this.pendingClearance = 0;

    const now = new Date();
    const clearanceDate = new Date(now);
    clearanceDate.setDate(clearanceDate.getDate() - this.clearancePeriodDays);

    this.dashboard.recentOrders.forEach(order => {
      const orderTotal = order.totalAmount || 0;
      const orderCommission = (orderTotal * this.commissionRate) / 100;
      const orderProfit = orderTotal - orderCommission;

      // 1. Total Revenue (Delivered only)
      if (order.vendorOrderStatus === this.VendorOrderStatus.Delivered) {
        this.totalRevenue += orderTotal;

        // 5. Pending Clearance (تم التسليم لكن داخل فترة التقييد)
        const deliveredDate = new Date(order.createdAt); // أو order.deliveredAt لو متاح
        if (deliveredDate > clearanceDate) {
          this.pendingClearance += orderProfit;
        }
      }
      // 4. In-Transit Revenue (خرج من التاجر لكن لم يُسلّم)
      else if (
        order.vendorOrderStatus === this.VendorOrderStatus.PickedFromVendor ||
        order.vendorOrderStatus === this.VendorOrderStatus.InWarehouse ||
        order.vendorOrderStatus === this.VendorOrderStatus.OutForDelivery
      ) {
        this.inTransitRevenue += orderProfit;
      }
    });

    // 2. Total Commission
    this.totalCommission = (this.totalRevenue * this.commissionRate) / 100;

    // 3. Net Profit
    this.netProfit = this.totalRevenue - this.totalCommission;

    // 6. Available Balance (نفترض إنه = صافي الربح - Pending Clearance - Pending Withdrawal)
    // ✅ هنا لازم تجيب الـ Pending Withdrawal من الـ backend
    this.pendingWithdrawal = this.dashboard.pendingWithdrawal || 0;
    this.totalWithdrawn = this.dashboard.totalWithdrawn || 0;

    this.availableBalance = this.netProfit - this.pendingClearance - this.pendingWithdrawal;

    this.cdr.detectChanges();
  }

  resetFinancials(): void {
    this.totalRevenue = 0;
    this.totalCommission = 0;
    this.netProfit = 0;
    this.inTransitRevenue = 0;
    this.pendingClearance = 0;
    this.availableBalance = 0;
    this.pendingWithdrawal = 0;
    this.totalWithdrawn = 0;
  }

  // Calculate profit for individual order
  calculateOrderProfit(order: any): number {
    const total = order.totalAmount || 0;
    const commission = (total * this.commissionRate) / 100;
    return total - commission;
  }

  // Calculate commission for individual order
  calculateOrderCommission(order: any): number {
    return ((order.totalAmount || 0) * this.commissionRate) / 100;
  }

  // Check if order profit is confirmed
  isOrderProfitConfirmed(order: any): boolean {
    return order.vendorOrderStatus === this.VendorOrderStatus.Delivered;
  }

  addVariant(): void {
    this.productForm.variants.push({
      size: '',
      color: '',
      stock: 0,
      priceAdjustment: 0
    });
  }

  removeVariant(index: number): void {
    this.productForm.variants.splice(index, 1);
  }

  // ═══════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════

  loadDashboard(): void {
    this.isLoadingDashboard = true;
    this.vendorService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboard = res.data;
          console.log('Dashboard loaded:', this.dashboard);

          // ✅ Calculate financials after loading dashboard
          this.calculateFinancials();
        }
        this.isLoadingDashboard = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingDashboard = false;
        this.showToast(this.t('error_loading'), 'error');
      }
    });
  }

  // ═══════════════════════════════════════════════
  // ORDER OPERATIONS
  // ═══════════════════════════════════════════════

  viewOrderDetails(order: any): void {
    // Mark as seen when vendor views the order
    if (!order.isVendorSeen) {
      this.orderService.markAsVendorSeen(order.id).subscribe({
        next: (res) => {
          if (res.success) {
            order.isVendorSeen = true;
            if (this.dashboard) {
              this.dashboard.pendingOrders = Math.max(0, this.dashboard.pendingOrders - 1);
            }
            this.cdr.detectChanges();
          }
        }
      });
    }

    this.selectedOrderId = order.id;
    this.showOrderModal = true;
    this.loadOrderDetails(order.id);
  }

  loadOrderDetails(orderId: number): void {
    this.isLoadingOrder = true;
    this.vendorService.loadOrderDetails(orderId).subscribe({
      next: (res: any) => {
        if (res.success) {
          // ✅ جيب الـ order من الـ dashboard
          const vendorOrder = this.dashboard?.recentOrders?.find(o => o.id === orderId);

          if (vendorOrder) {
            // ✅ فلتر المنتجات + استبدال البيانات المالية
            this.orderDetails = {
              ...res.data,
              // ✅ فقط منتجات التاجر
              items: res.data.items.filter((item: any) =>
                vendorOrder.items.some(vi => vi.productId === item.productId)
              ),
              // ✅ البيانات المالية الخاصة بالتاجر
              subTotal: vendorOrder.vendorSubTotal,
              vendorSubTotal: vendorOrder.vendorSubTotal,
              vendorShippingShare: vendorOrder.vendorShippingShare,
              shippingCost: vendorOrder.vendorShippingShare,
              total: vendorOrder.totalAmount,
              totalAmount: vendorOrder.totalAmount
            };
          } else {
            this.orderDetails = res.data;
          }

          console.log('Order details (vendor filtered):', this.orderDetails);
        }
        this.isLoadingOrder = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingOrder = false;
      }
    });
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.orderDetails = null;
    this.selectedOrderId = null;
  }

  openCancelModal(order: any, event?: Event): void {
    event?.stopPropagation();
    this.cancelOrderId = order.id;
    this.cancelReason = '';
    this.showCancelModal = true;
    this.cdr.markForCheck();
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelOrderId = null;
    this.cancelReason = '';
  }

  confirmCancelOrder(): void {
    if (!this.cancelOrderId || !this.cancelReason.trim()) {
      this.showToast(this.i18n.currentLang === 'ar' ? 'أدخل سبب الإلغاء' : 'Enter cancellation reason', 'error');
      return;
    }
    this.isCancelling = true;
    this.vendorService.cancelOrder(this.cancelOrderId, this.cancelReason).subscribe({
      next: (res: any) => {
        if (res.success) {
          const order = this.dashboard?.recentOrders?.find(o => o.id === this.cancelOrderId);
          if (order) {
            (order as any).status = 8; // Cancelled
            (order as any).cancellationReason = this.cancelReason;
            (order as any).cancelledBy = 'Vendor';
          }
          this.cdr.detectChanges();
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم إلغاء الطلب' : 'Order cancelled', 'success');
          this.closeCancelModal();
        } else {
          this.showToast(res.message || 'Error', 'error');
        }
        this.isCancelling = false;
      },
      error: (err: any) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isCancelling = false;
      }
    });
  }

  canCancelOrder(order: any): boolean {
    if (order.status === 'Cancelled' || order.status === 'Delivered') return false;
    if (order.vendorOrderStatus >= 2) return false; // PickedFromVendor or later
    const s = typeof order.status === 'string' ? parseInt(order.status) : order.status;
    return isNaN(s) || (s !== 8 && s !== 6);
  }

  canUpdateVendorOrderStatus(vendorOrderStatus: number | string): boolean {
    const statusNum = typeof vendorOrderStatus === 'string' ? parseInt(vendorOrderStatus) : vendorOrderStatus;
    return statusNum === this.VendorOrderStatus.Pending ||
      statusNum === this.VendorOrderStatus.Assigned;
  }

  getVendorOrderStatusBadge(vendorOrderStatus: number | string): { text: string; class: string } {
    const statusNum = typeof vendorOrderStatus === 'string' ? parseInt(vendorOrderStatus) : vendorOrderStatus;

    const statusMap: { [key: number]: { ar: string; en: string; class: string } } = {
      [this.VendorOrderStatus.Pending]: { ar: 'قيد الانتظار', en: 'Pending', class: 'pending' },
      [this.VendorOrderStatus.Assigned]: { ar: 'يتم التجهيز', en: 'Processing', class: 'processing' },
      [this.VendorOrderStatus.PickedFromVendor]: { ar: 'جاهز للاستلام', en: 'Ready for Pickup', class: 'ready-pickup' },
      [this.VendorOrderStatus.InWarehouse]: { ar: 'في المخزن', en: 'In Warehouse', class: 'warehouse' },
      [this.VendorOrderStatus.OutForDelivery]: { ar: 'في الطريق', en: 'Out for Delivery', class: 'out-for-delivery' },
      [this.VendorOrderStatus.Delivered]: { ar: 'تم التسليم', en: 'Delivered', class: 'delivered' },
      [this.VendorOrderStatus.Cancelled]: { ar: 'ملغي', en: 'Cancelled', class: 'cancelled' }
    };

    const s = statusMap[statusNum] || { ar: String(vendorOrderStatus), en: String(vendorOrderStatus), class: '' };
    return { text: this.i18n.currentLang === 'ar' ? s.ar : s.en, class: s.class };
  }

  updateVendorOrderStatus(order: any, newStatus: string): void {
    console.log('🔍 Update triggered:', {
      orderId: order.id,
      vendorOrderId: order.vendorOrderId,
      currentStatus: order.vendorOrderStatus,
      newStatus: newStatus
    });

    const vendorOrderId = order.vendorOrderId;

    if (!vendorOrderId || vendorOrderId === 0) {
      this.showToast(this.t('vendor_order_not_found'), 'error');
      console.error('❌ VendorOrderId is missing:', order);
      return;
    }

    this.isUpdatingStatus = true;
    this.vendorService.updateVendorOrderStatus(vendorOrderId, newStatus).subscribe({
      next: (res: any) => {
        console.log('✅ Backend response:', res);
        this.isUpdatingStatus = false;

        if (res.success) {
          order.vendorOrderStatus = parseInt(newStatus);
          console.log('✅ Status updated locally:', order.vendorOrderStatus);

          this.showToast(this.t('status_updated'), 'success');

          // ✅ Recalculate financials after status change
          this.calculateFinancials();

          this.cdr.detectChanges();

          setTimeout(() => {
            this.loadDashboard();
          }, 500);
        } else {
          console.error('❌ Backend returned failure:', res.message);
          this.showToast(res.message || this.t('error'), 'error');
        }
      },
      error: (err) => {
        console.error('❌ HTTP Error:', err);
        this.isUpdatingStatus = false;
        this.showToast(this.t('error'), 'error');
      }
    });
  }

  // ═══════════════════════════════════════════════
  // PRODUCTS (Keep existing methods)
  // ═══════════════════════════════════════════════

  loadProducts(): void {
    this.isLoadingProducts = true;

    const filter = { ...this.filter };
    if (this.statusFilter !== null) {
      (filter as any).status = this.statusFilter;
    }

    this.vendorService.getProducts(filter).subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.data;
          this.totalCount = res.pagination.totalCount;
          this.totalPages = res.pagination.totalPages;
          this.currentPage = res.pagination.currentPage;
          this.hasPrev = res.pagination.hasPrevious;
          this.hasNext = res.pagination.hasNext;
        }
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProducts = false;
      }
    });
  }

  loadCategories(): void {
    this.productsService.getCategories(true).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
        }
      }
    });
  }

  loadBrands(): void {
    this.productsService.getBrands(true).subscribe({
      next: (res) => {
        if (res.success) {
          this.brands = res.data;
        }
      }
    });
  }

  onStatusFilterChange(status: number | null): void {
    this.statusFilter = status;
    this.filter.page = 1;
    this.loadProducts();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.search = input.value;
    this.filter.page = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.filter.page = page;
    this.loadProducts();
  }

  nextPage(): void {
    if (this.hasNext) this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    if (this.hasPrev) this.goToPage(this.currentPage - 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ═══════════════════════════════════════════════
  // SALES REPORT
  // ═══════════════════════════════════════════════

  loadSalesReport(): void {
    let from: Date;
    let to = new Date();

    switch (this.reportPeriod) {
      case '7d':
        from = new Date();
        from.setDate(from.getDate() - 7);
        break;
      case '30d':
        from = new Date();
        from.setDate(from.getDate() - 30);
        break;
      case '90d':
        from = new Date();
        from.setDate(from.getDate() - 90);
        break;
      case 'custom':
        if (!this.customDateFrom || !this.customDateTo) return;
        from = new Date(this.customDateFrom);
        to = new Date(this.customDateTo);
        break;
      default:
        from = new Date();
        from.setDate(from.getDate() - 30);
    }

    this.vendorService.getSalesReport(from, to).subscribe({
      next: (res) => {
        if (res.success) {
          this.salesReport = res.data;
          this.cdr.detectChanges();
        }
      }
    });
  }

  onReportPeriodChange(period: '7d' | '30d' | '90d' | 'custom'): void {
    this.reportPeriod = period;
    if (period !== 'custom') {
      this.loadSalesReport();
    }
  }

  // ═══════════════════════════════════════════════
  // PRODUCT CRUD (Keep all existing methods)
  // ═══════════════════════════════════════════════

  openAddProductDialog(): void {
    this.isEditMode = false;
    this.selectedProduct = null;
    this.resetProductForm();
    this.showProductDialog = true;
    document.body.style.overflow = 'hidden';
  }

 openEditProductDialog(product: ProductList): void {
  this.isEditMode = true;
  this.selectedProduct = product;

  this.productsService.getById(product.id).subscribe({
    next: (res) => {
      if (res.success) {
        const p = res.data;
        this.productForm = {
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          descriptionAr: p.descriptionAr || '',
          descriptionEn: p.descriptionEn || '',
          price: p.price,
          originalPrice: p.originalPrice,
          costPrice: p.costPrice || null,
          stock: p.stock,
          lowStockThreshold: 5,
          categoryId: p.categoryId,
          brandId: p.brandId,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          mainImage: p.mainImage,
          images: p.images || [],
          hasVariants: p.hasVariants || false,
          variants: p.variants?.map((v: any) => ({
            id: v.id,
            size: v.size || '',
            color: v.color || '',
            stock: v.stock || 0,
            priceAdjustment: v.priceAdjustment || 0
          })) || []
        };
        this.mainImagePreview = p.mainImage ? this.getImageUrl(p.mainImage) : null;
        this.imagesPreview = p.images?.map((img: string) => this.getImageUrl(img)) || [];
        this.showProductDialog = true;
        document.body.style.overflow = 'hidden';
        this.cdr.detectChanges();
      }
    }
  });
}

  closeProductDialog(): void {
    this.showProductDialog = false;
    this.resetProductForm();
    document.body.style.overflow = '';
  }

  resetProductForm(): void {
    this.productForm = {
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      price: 0,
      originalPrice: null,
      costPrice: null,
      stock: 0,
      lowStockThreshold: 5,
      categoryId: null,
      brandId: null,
      isActive: true,
      isFeatured: false,
      mainImage: '',
      images: [],
      hasVariants: false,  // ✅
      variants: []
    };
    this.selectedMainImage = null;
    this.selectedImages = [];
    this.mainImagePreview = null;
    this.imagesPreview = [];
  }

  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.showToast(this.t('invalid_image'), 'error');
        return;
      }
      this.selectedMainImage = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.mainImagePreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.selectedImages.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagesPreview.push(e.target?.result as string);
            this.cdr.detectChanges();
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeMainImage(): void {
    this.selectedMainImage = null;
    this.mainImagePreview = null;
    this.productForm.mainImage = '';
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagesPreview.splice(index, 1);
  }

  async saveProduct(): Promise<void> {
    if (!this.validateProductForm()) return;

    this.isSubmitting = true;

    try {
      let mainImageUrl = this.productForm.mainImage;
      if (this.selectedMainImage) {
        const res = await this.vendorService.uploadImage(this.selectedMainImage).toPromise();
        if (res?.success) {
          mainImageUrl = res.data;
        }
      }

      const imageUrls: string[] = [];
      for (const file of this.selectedImages) {
        const res = await this.vendorService.uploadImage(file).toPromise();
        if (res?.success) {
          imageUrls.push(res.data);
        }
      }

      const data = {
        ...this.productForm,
        mainImage: mainImageUrl || 'https://via.placeholder.com/400',
        images: imageUrls.length > 0 ? imageUrls : this.productForm.images
      };

      const request = this.isEditMode && this.selectedProduct
        ? this.vendorService.updateProduct(this.selectedProduct.id, data)
        : this.vendorService.createProduct(data);

      request.subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast(
              this.isEditMode ? this.t('product_updated') : this.t('product_created'),
              'success'
            );
            this.loadProducts();
            this.loadDashboard();
            this.closeProductDialog();
          } else {
            this.showToast(res.message || 'Error', 'error');
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Error', 'error');
          this.isSubmitting = false;
        }
      });
    } catch (error) {
      this.showToast('Error uploading images', 'error');
      this.isSubmitting = false;
    }
  }

  validateProductForm(): boolean {
    if (!this.productForm.nameAr || !this.productForm.nameEn) {
      this.showToast(this.t('name_required'), 'error');
      return false;
    }
    if (!this.productForm.price || this.productForm.price <= 0) {
      this.showToast(this.t('price_required'), 'error');
      return false;
    }
    if (!this.productForm.categoryId) {
      this.showToast(this.t('category_required'), 'error');
      return false;
    }
    return true;
  }

  openDeleteDialog(product: ProductList): void {
    this.productToDelete = product;
    this.showDeleteDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.productToDelete = null;
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this.isDeleting = true;
    this.vendorService.deleteProduct(this.productToDelete.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('product_deleted'), 'success');
          this.loadProducts();
          this.loadDashboard();
          this.closeDeleteDialog();
        } else {
          this.showToast(res.message || 'Error', 'error');
        }
        this.isDeleting = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isDeleting = false;
      }
    });
  }

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  getName(item: any): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : item.nameEn;
  }

  getImageUrl(image: string | null): string {
    if (!image) return 'assets/images/placeholder.png';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  formatPrice(price: number): string {
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusBadge(status: number): { text: string; class: string } {
    switch (status) {
      case 0:
        return { text: this.i18n.currentLang === 'ar' ? 'قيد المراجعة' : 'Pending', class: 'pending' };
      case 1:
        return { text: this.i18n.currentLang === 'ar' ? 'مقبول' : 'Approved', class: 'approved' };
      case 2:
        return { text: this.i18n.currentLang === 'ar' ? 'مرفوض' : 'Rejected', class: 'rejected' };
      default:
        return { text: '', class: '' };
    }
  }

  getTrackingSteps(status: string | number): { labelAr: string; labelEn: string; completed: boolean; active: boolean; cancelled: boolean }[] {
    const statusNumMap: { [key: string]: number } = {
      'Pending': 0, 'VendorSeen': 1, 'Confirmed': 2, 'Processing': 3,
      'Shipped': 4, 'OutForDelivery': 5, 'Delivered': 6, 'Cancelled': 8
    };
    const s = typeof status === 'number' ? status : (statusNumMap[status] ?? (parseInt(status) || 0));
    const isCancelled = s === 8;

    const steps = [
      { labelAr: 'قيد الانتظار', labelEn: 'Pending', value: 0 },
      { labelAr: 'تأكيد', labelEn: 'Confirmed', value: 2 },
      { labelAr: 'شحن', labelEn: 'Shipped', value: 4 },
      { labelAr: 'تم التوصيل', labelEn: 'Delivered', value: 6 },
    ];

    if (isCancelled) {
      return steps.map(step => ({
        labelAr: step.labelAr,
        labelEn: step.labelEn,
        completed: false,
        active: false,
        cancelled: true
      })).concat([{
        labelAr: 'ملغي',
        labelEn: 'Cancelled',
        completed: false,
        active: true,
        cancelled: true
      }]);
    }

    return steps.map(step => ({
      labelAr: step.labelAr,
      labelEn: step.labelEn,
      completed: s > step.value,
      active: s >= step.value && s <= step.value + 1,
      cancelled: false
    }));
  }

  getOrderStatusBadge(status: string | number): { text: string; class: string } {
    const statusMap: { [key: string]: { ar: string; en: string; class: string } } = {
      'Pending': { ar: 'قيد الانتظار', en: 'Pending', class: 'pending' },
      '0': { ar: 'قيد الانتظار', en: 'Pending', class: 'pending' },
      'Processing': { ar: 'قيد التجهيز', en: 'Processing', class: 'processing' },
      '3': { ar: 'قيد التجهيز', en: 'Processing', class: 'processing' },
      'Shipped': { ar: 'تم الشحن', en: 'Shipped', class: 'shipped' },
      '4': { ar: 'تم الشحن', en: 'Shipped', class: 'shipped' },
      'Delivered': { ar: 'تم التوصيل', en: 'Delivered', class: 'delivered' },
      '6': { ar: 'تم التوصيل', en: 'Delivered', class: 'delivered' },
      'Cancelled': { ar: 'ملغي', en: 'Cancelled', class: 'cancelled' },
      '8': { ar: 'ملغي', en: 'Cancelled', class: 'cancelled' }
    };
    const key = String(status);
    const s = statusMap[key] || { ar: key, en: key, class: '' };
    return { text: this.i18n.currentLang === 'ar' ? s.ar : s.en, class: s.class };
  }

  getRevenueGrowth(): number {
    if (!this.dashboard || this.dashboard.lastMonthRevenue === 0) return 0;
    return Math.round(
      ((this.dashboard.thisMonthRevenue - this.dashboard.lastMonthRevenue) / this.dashboard.lastMonthRevenue) * 100
    );
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'error_loading': { ar: 'حدث خطأ في التحميل', en: 'Error loading data' },
      'product_created': { ar: 'تم إضافة المنتج بنجاح وسيتم مراجعته', en: 'Product added and pending review' },
      'product_updated': { ar: 'تم تحديث المنتج وسيتم مراجعته', en: 'Product updated and pending review' },
      'product_deleted': { ar: 'تم حذف المنتج', en: 'Product deleted' },
      'invalid_image': { ar: 'الملف ليس صورة', en: 'File is not an image' },
      'name_required': { ar: 'يرجى إدخال اسم المنتج', en: 'Please enter product name' },
      'price_required': { ar: 'يرجى إدخال سعر صحيح', en: 'Please enter valid price' },
      'category_required': { ar: 'يرجى اختيار التصنيف', en: 'Please select category' },
      'status_updated': { ar: 'تم تحديث الحالة', en: 'Status updated' },
      'vendor_order_not_found': { ar: 'معرف طلب التاجر غير موجود', en: 'Vendor Order ID not found' },
      'error': { ar: 'حدث خطأ', en: 'An error occurred' },
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  trackByProduct(index: number, product: ProductList): number {
    return product.id;
  }

  getTotalOrders(): number {
    if (!this.salesReport || this.salesReport.length === 0) return 0;
    return this.salesReport.reduce((sum, day) => sum + day.ordersCount, 0);
  }

  getTotalProductsSold(): number {
    if (!this.salesReport || this.salesReport.length === 0) return 0;
    return this.salesReport.reduce((sum, day) => sum + day.productsSold, 0);
  }
}