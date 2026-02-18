import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SalesReport, VendorDashboard } from '../../../../models/vendor';
import { ProductFilter, ProductList } from '../../../../models/products';
import { Category } from '../../../../models/category';
import { Brand } from '../../../../models/brand';
import { I18nService } from '../../../../core/services/i18n.service';
import { VendorService } from '../../services/vendor.service';
import { ProductsService } from '../../../products/services/products.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-vendor',
  standalone: false,
  templateUrl: './vendor-dashboard.component.html',
  styleUrl: './vendor-dashboard.component.css',
})
export class VendorDashboardComponent implements OnInit {
  // Dashboard Data
  dashboard: VendorDashboard | null = null;
  isLoadingDashboard = true;

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
    images: [] as string[]
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

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    public i18n: I18nService,
    private vendorService: VendorService,
    private productsService: ProductsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Check if user is vendor
    // const role = localStorage.getItem('NHC_MP_Role');
    // console.log('Current Role:', role);
    // if (role !== 'Vendor' && role !== 'Admin') {
    //   this.router.navigate(['/']);
    //   return;
    // }

    this.loadDashboard();
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
    this.loadSalesReport();
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
  // PRODUCTS
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
  // PRODUCT CRUD
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

    // Load full product details
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
            images: p.images || []
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
      images: []
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
      // Upload main image
      let mainImageUrl = this.productForm.mainImage;
      if (this.selectedMainImage) {
        const res = await this.vendorService.uploadImage(this.selectedMainImage).toPromise();
        if (res?.success) {
          mainImageUrl = res.data;
        }
      }

      // Upload additional images
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

  // Delete Product
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

  getOrderStatusBadge(status: string): { text: string; class: string } {
    const statusMap: { [key: string]: { ar: string; en: string; class: string } } = {
      'Pending': { ar: 'قيد الانتظار', en: 'Pending', class: 'pending' },
      'Processing': { ar: 'قيد التجهيز', en: 'Processing', class: 'processing' },
      'Shipped': { ar: 'تم الشحن', en: 'Shipped', class: 'shipped' },
      'Delivered': { ar: 'تم التوصيل', en: 'Delivered', class: 'delivered' },
      'Cancelled': { ar: 'ملغي', en: 'Cancelled', class: 'cancelled' }
    };
    const s = statusMap[status] || { ar: status, en: status, class: '' };
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
      'category_required': { ar: 'يرجى اختيار التصنيف', en: 'Please select category' }
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
