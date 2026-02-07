import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductFilter, ProductList } from '../../../../models/products';
import { Category } from '../../../../models/category';
import { Brand } from '../../../../models/brand';
import { I18nService } from '../../../../core/services/i18n.service';
import { ProductsService } from '../../services/products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProductsComponent implements OnInit {
  showAddDialog = false;
  showEditDialog = false;
  showDeleteDialog = false;
  isSubmitting = false;

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

  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };


  products: ProductList[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];

  isLoading = true;
  isAdmin = false;
  isLoadingMore = false;

  // Filter
  filter: ProductFilter = {
    page: 1,
    pageSize: 12,
    sortBy: 'newest',
    sortDesc: true
  };

  // Pagination
  totalCount = 0;
  totalPages = 0;
  hasMore = false;

  // UI State
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;
  showMobileFilters = false;

  // Price Range
  minPrice: number | null = null;
  maxPrice: number | null = null;
  priceRange = { min: 0, max: 10000 };

  // Sort Options
  sortOptions = [
    { value: 'newest', label: { ar: 'الأحدث', en: 'Newest' } },
    { value: 'price-low', label: { ar: 'السعر: من الأقل للأعلى', en: 'Price: Low to High' } },
    { value: 'price-high', label: { ar: 'السعر: من الأعلى للأقل', en: 'Price: High to Low' } },
    { value: 'rating', label: { ar: 'التقييم', en: 'Rating' } },
    { value: 'sales', label: { ar: 'الأكثر مبيعاً', en: 'Best Selling' } }
  ];

  selectedSort = 'newest';

  constructor(
    public i18n: I18nService,
    private productService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('NHC_MP_Role') === "Admin") {
      this.isAdmin = true;
    }

    this.loadCategories();
    this.loadBrands();

    // Read query params
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) this.filter.categoryId = +params['categoryId'];
      if (params['brandId']) this.filter.brandId = +params['brandId'];
      if (params['search']) this.filter.search = params['search'];
      this.loadProducts();
    });
  }

  // ═══════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════

  loadProducts(append = false): void {
    if (append) {
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
      this.filter.page = 1;
    }

    this.productService.getAll(this.filter).subscribe({
      next: (res) => {
        console.log(res);

        if (res.success) {
          if (append) {
            this.products = [...this.products, ...res.data];
          } else {
            this.products = res.data;
          }
          this.totalCount = res.pagination.totalCount;
          this.totalPages = res.pagination.totalPages;
          this.hasMore = res.pagination.hasNext;
        }
        this.isLoading = false;
        this.isLoadingMore = false;
        this.cdr.markForCheck();

      },
      error: () => {
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories(true).subscribe({
      next: (res) => {

        if (res.success) {
          this.categories = res.data;
          this.cdr.markForCheck();
        }
      }
    });
  }

  loadBrands(): void {
    this.productService.getBrands(true).subscribe({
      next: (res) => {
        if (res.success) {
          this.brands = res.data;
        }
      }
    });
  }

  // ═══════════════════════════════════════════════
  // FILTERS
  // ═══════════════════════════════════════════════

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.search = input.value;
    this.loadProducts();
  }

  onCategoryChange(categoryId: number | null): void {
    this.filter.categoryId = categoryId || undefined;
    this.updateUrl();
    this.loadProducts();
  }

  onBrandChange(brandId: number | null): void {
    this.filter.brandId = brandId || undefined;
    this.updateUrl();
    this.loadProducts();
  }

  onPriceFilter(): void {
    this.filter.minPrice = this.minPrice || undefined;
    this.filter.maxPrice = this.maxPrice || undefined;
    this.loadProducts();
  }

  onSortChange(sort: string): void {
    this.selectedSort = sort;
    switch (sort) {
      case 'newest':
        this.filter.sortBy = 'newest';
        this.filter.sortDesc = true;
        break;
      case 'price-low':
        this.filter.sortBy = 'price';
        this.filter.sortDesc = false;
        break;
      case 'price-high':
        this.filter.sortBy = 'price';
        this.filter.sortDesc = true;
        break;
      case 'rating':
        this.filter.sortBy = 'rating';
        this.filter.sortDesc = true;
        break;
      case 'sales':
        this.filter.sortBy = 'sales';
        this.filter.sortDesc = true;
        break;
    }
    this.loadProducts();
  }

  onInStockChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.filter.inStock = checkbox.checked || undefined;
    this.loadProducts();
  }

  clearFilters(): void {
    this.filter = {
      page: 1,
      pageSize: 12,
      sortBy: 'newest',
      sortDesc: true
    };
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedSort = 'newest';
    this.router.navigate(['/products']);
    this.loadProducts();
  }

  loadMore(): void {
    if (this.hasMore && !this.isLoadingMore) {
      this.filter.page = (this.filter.page || 1) + 1;
      this.loadProducts(true);
    }
  }

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  updateUrl(): void {
    const queryParams: any = {};
    if (this.filter.categoryId) queryParams.categoryId = this.filter.categoryId;
    if (this.filter.brandId) queryParams.brandId = this.filter.brandId;
    if (this.filter.search) queryParams.search = this.filter.search;
    this.router.navigate(['/products'], { queryParams });
  }

  getName(item: any): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : item.nameEn;
  }

  getCategoryName(item: ProductList): string {
    return this.i18n.currentLang === 'ar' ? (item.categoryNameAr || '') : (item.categoryNameEn || '');
  }

  getImageUrl(image: string | null): string {
    if (!image) return 'assets/images/placeholder.png';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  formatPrice(price: number): string {
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ر.س' : 'SAR');
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
    document.body.style.overflow = this.showMobileFilters ? 'hidden' : '';
  }

  getSelectedCategoryName(): string {
    const cat = this.categories.find(c => c.id === this.filter.categoryId);
    return cat ? this.getName(cat) : '';
  }

  getSelectedBrandName(): string {
    const brand = this.brands.find(b => b.id === this.filter.brandId);
    return brand ? this.getName(brand) : '';
  }

  clearPriceFilter(): void {
    this.minPrice = null;
    this.maxPrice = null;
    this.onPriceFilter();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filter.categoryId) count++;
    if (this.filter.brandId) count++;
    if (this.filter.minPrice || this.filter.maxPrice) count++;
    if (this.filter.inStock) count++;
    return count;
  }

  trackByProduct(index: number, product: ProductList): number {
    return product.id;
  }

  openAddDialog(): void {
    this.resetForm();
    this.showAddDialog = true;
  }

  openEditDialog(product: ProductList): void {
    this.selectedProduct = product;
    // Load full product details
    this.productService.getById(product.id).subscribe({
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
          this.imagesPreview = p.images?.map(img => this.getImageUrl(img)) || [];
          this.showEditDialog = true;
          this.cdr.detectChanges();
        }
      }
    });
  }

  openDeleteDialog(product: ProductList): void {
    this.selectedProduct = product;
    this.showDeleteDialog = true;
  }

  closeAllDialogs(): void {
    this.showAddDialog = false;
    this.showEditDialog = false;
    this.showDeleteDialog = false;
    this.selectedProduct = null;
    this.resetForm();
  }

  resetForm(): void {
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
        this.showToast(this.i18n.currentLang === 'ar' ? 'يرجى اختيار صورة' : 'Please select an image', 'error');
        return;
      }
      this.selectedMainImage = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.mainImagePreview = e.target?.result as string;
        this.cdr.detectChanges(); // أضف هنا جوا الـ callback
      };
      reader.readAsDataURL(file);
    }
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          this.selectedImages.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagesPreview.push(e.target?.result as string);
            this.cdr.detectChanges(); // أضف هنا جوا الـ callback
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

  async createProduct(): Promise<void> {
    if (!this.validateForm()) return;

    this.isSubmitting = true;

    try {
      // Upload main image first
      let mainImageUrl = this.productForm.mainImage;
      if (this.selectedMainImage) {
        const res = await this.productService.uploadImage(this.selectedMainImage).toPromise();
        if (res?.success) {
          mainImageUrl = res.data;
        }
      }

      // Upload additional images
      const imageUrls: string[] = [];
      for (const file of this.selectedImages) {
        const res = await this.productService.uploadImage(file).toPromise();
        if (res?.success) {
          imageUrls.push(res.data);
        }
      }

      const data = {
        ...this.productForm,
        mainImage: mainImageUrl || 'https://via.placeholder.com/400',
        images: imageUrls.length > 0 ? imageUrls : this.productForm.images
      };

      this.productService.create(data).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast(this.i18n.currentLang === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully', 'success');
            this.loadProducts();
            this.closeAllDialogs();
          } else {
            this.showToast(res.message, 'error');
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

  updateProduct(): void {
    if (!this.selectedProduct || !this.validateForm()) return;

    this.isSubmitting = true;

    const data = {
      ...this.productForm,
      mainImage: this.mainImagePreview || this.productForm.mainImage,
      images: this.imagesPreview.length > 0 ? this.imagesPreview : this.productForm.images
    };

    this.productService.update(this.selectedProduct.id, data).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully', 'success');
          this.loadProducts();
          this.closeAllDialogs();
        } else {
          this.showToast(res.message, 'error');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isSubmitting = false;
      }
    });
  }

  deleteProduct(): void {
    if (!this.selectedProduct) return;

    this.isSubmitting = true;

    this.productService.delete(this.selectedProduct.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully', 'success');
          this.loadProducts();
          this.closeAllDialogs();
        } else {
          this.showToast(res.message, 'error');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isSubmitting = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.productForm.nameAr || !this.productForm.nameEn) {
      this.showToast(this.i18n.currentLang === 'ar' ? 'يرجى إدخال اسم المنتج' : 'Please enter product name', 'error');
      return false;
    }
    if (!this.productForm.price || this.productForm.price <= 0) {
      this.showToast(this.i18n.currentLang === 'ar' ? 'يرجى إدخال سعر صحيح' : 'Please enter valid price', 'error');
      return false;
    }
    if (!this.productForm.categoryId) {
      this.showToast(this.i18n.currentLang === 'ar' ? 'يرجى اختيار التصنيف' : 'Please select category', 'error');
      return false;
    }
    return true;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 3000);
  }

  onDialogBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.closeAllDialogs();
    }
  }

  goToProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  approveProduct(product: ProductList): void {
  this.isSubmitting = true;
  
  this.productService.updateStatus(product.id, { status: 1 }).subscribe({
    next: (res) => {
      if (res.success) {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'تم قبول المنتج بنجاح' : 'Product approved successfully', 
          'success'
        );
        this.loadProducts();
      }
      this.isSubmitting = false;
    },
    error: () => {
      this.showToast('Error', 'error');
      this.isSubmitting = false;
    }
  });
}
}
