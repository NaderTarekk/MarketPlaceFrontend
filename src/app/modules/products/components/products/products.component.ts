// products.component.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductFilter, ProductList } from '../../../../models/products';
import { Category } from '../../../../models/category';
import { Brand } from '../../../../models/brand';
import { I18nService } from '../../../../core/services/i18n.service';
import { ProductsService } from '../../services/products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environment';
import { AuthService } from '../../../auth/services/auth.service';
import { CartService } from '../../../cart/services/cart.service';
import { forkJoin } from 'rxjs';

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

  // 🆕 Categories - الهرمية
  categories: Category[] = [];           // الأصناف الرئيسية مع أبنائها
  allCategories: Category[] = [];        // كل الأصناف (flat) للـ dropdown
  expandedCategories: Set<number> = new Set(); // الأصناف المفتوحة في الـ sidebar

  brands: Brand[] = [];

  isLoading = true;
  isAdmin = false;
  isLoadingMore = false;

  // Filter
  filter: ProductFilter = {
    page: 1,
    pageSize: 9,
    sortBy: 'newest',
    sortDesc: true
  };
  currentPage = 1;
  hasPrev = false;
  hasNext = false;

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

  selectedBrand: Brand | null = null;
  selectedBrandId: number | null = null;
  selectedBrandCategoryId: number | null = null;
  brandBestSellers: ProductList[] = [];
  brandCategories: Category[] = [];
  isBrandLoading = false;
  readonly brandPlaceholder = 'https://placehold.co/80x80/f1f5f9/94a3b8?text=Brand';
 selectedParentCategory: Category | null = null;
 
  constructor(
    public i18n: I18nService,
    private productService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('NHC_MP_Role') === "Admin") {
      this.isAdmin = true;
    }

    this.loadCategoriesHierarchy();
    this.loadBrands();

    // Read query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.filter.categoryId = +params['category'];
        // 🆕 Auto-expand parent if subcategory is selected
        this.expandParentOfCategory(+params['category']);
        console.log(1);
      } else if (params['categoryId']) {
        this.filter.categoryId = +params['categoryId'];
        console.log(2);
        this.expandParentOfCategory(+params['categoryId']);
      }

      if (params['brand']) {
        this.filter.brandId = +params['brand'];
      } else if (params['brandId']) {
        this.filter.brandId = +params['brandId'];
      }

      if (params['search']) {
        this.filter.search = params['search'];
      }

      this.loadProducts();
    });
  }

  // ═══════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════

  loadProducts(): void {
    this.isLoading = true;

    this.productService.getAll(this.filter).subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.data;
          this.totalCount = res.pagination.totalCount;
          this.totalPages = res.pagination.totalPages;
          this.currentPage = res.pagination.currentPage;
          this.hasPrev = res.pagination.hasPrevious;
          this.hasNext = res.pagination.hasNext;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // 🆕 Load categories with hierarchy
  loadCategoriesHierarchy(): void {
    this.productService.getCategoriesHierarchy().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
          // 🆕 Create flat list for dropdowns
          this.allCategories = this.flattenCategories(res.data);

          // ✅ فتح كل الأصناف الرئيسية تلقائياً
          this.expandAllCategories();

          this.cdr.markForCheck();
        }
      }
    });
  }

  // ✅ أضف هذا الـ method الجديد
  expandAllCategories(): void {
    for (const category of this.categories) {
      if (this.hasChildren(category)) {
        this.expandedCategories.add(category.id);
      }
    }
  }

  // 🆕 Flatten categories for dropdown
  flattenCategories(categories: Category[], parentName: string = ''): Category[] {
    let result: Category[] = [];

    for (const cat of categories) {
      // Add prefix for subcategories
      const displayCat = {
        ...cat,
        displayName: parentName ? `${parentName} > ${this.getName(cat)}` : this.getName(cat)
      };
      result.push(displayCat);

      if (cat.children && cat.children.length > 0) {
        result = result.concat(this.flattenCategories(cat.children, this.getName(cat)));
      }
    }

    return result;
  }

  // Legacy method for compatibility
  loadCategories(): void {
    this.loadCategoriesHierarchy();
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
  // 🆕 CATEGORY HIERARCHY HELPERS
  // ═══════════════════════════════════════════════

  // Toggle category expansion in sidebar
  toggleCategoryExpand(categoryId: number, event: Event): void {
    event.stopPropagation();
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  // Check if category has children
  hasChildren(category: Category): boolean {
    return category.children !== undefined && category.children.length > 0;
  }

  // Check if category is selected (or its parent)
  isCategorySelected(categoryId: number): boolean {
    return this.filter.categoryId === categoryId;
  }

  // Check if any child of this category is selected
  isChildSelected(category: Category): boolean {
    if (!category.children) return false;
    return category.children.some(child => this.filter.categoryId === child.id);
  }

  // Auto-expand parent when subcategory is selected
  expandParentOfCategory(categoryId: number): void {
    for (const parent of this.categories) {
      console.log(parent);
      console.log(this.categories);
      
      if (parent.children) {
        const found = parent.children.find(child => child.id === categoryId);
        if (found) {
          this.expandedCategories.add(parent.id);
          break;
        }
      }
    }
  }

  // Get total products count for category (including children)
  getTotalProductCount(category: Category): number {
    let total = category.productCount || 0;
    if (category.children) {
      for (const child of category.children) {
        total += child.productCount || 0;
      }
    }
    return total;
  }

  // Get selected category info
  getSelectedCategoryInfo(): { name: string; isChild: boolean; parentName?: string } | null {
    if (!this.filter.categoryId) return null;

    // Check in parent categories
    for (const parent of this.categories) {
      if (parent.id === this.filter.categoryId) {
        return { name: this.getName(parent), isChild: false };
      }

      // Check in children
      if (parent.children) {
        const child = parent.children.find(c => c.id === this.filter.categoryId);
        if (child) {
          return {
            name: this.getName(child),
            isChild: true,
            parentName: this.getName(parent)
          };
        }
      }
    }

    return null;
  }

  // ═══════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.filter.page = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage(): void {
    if (this.hasNext) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrev) {
      this.goToPage(this.currentPage - 1);
    }
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
  // FILTERS
  // ═══════════════════════════════════════════════

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.search = input.value;
    this.filter.page = 1;
    this.loadProducts();
  }

  onCategoryChange(categoryId: number | null): void {
    this.filter.categoryId = categoryId || undefined;
    this.filter.page = 1;
    this.updateUrl();
    this.loadProducts();
  }

  // 🆕 Select parent category (includes all children products)
  // في products.component.ts

// ═══════════════════════════════════════════════
// 🆕 CATEGORY HIERARCHY HELPERS
// ═══════════════════════════════════════════════

onParentCategorySelect(category: Category): void {
  this.filter.categoryId = category.id;
  this.filter.page = 1;
  
  // Expand to show children
  if (this.hasChildren(category)) {
    this.expandedCategories.add(category.id);
  }
  
  this.updateUrl();
  this.loadProducts(); // ✅ الـ Backend هيتعامل مع الـ children تلقائياً
}

onChildCategorySelect(child: Category, event: Event): void {
  event.stopPropagation();
  this.filter.categoryId = child.id;
  this.filter.page = 1;
  this.updateUrl();
  this.loadProducts();
}

  // ✅ Method جديدة تجيب الـ products من الـ parent + children
  loadProductsWithChildren(category: Category): void {
    this.isLoading = true;

    // ✅ اجمع كل الـ requests
    const requests = [
      this.productService.getAll({ ...this.filter, categoryId: category.id })
    ];

    // ✅ لو فيه children، اعمل request لكل child
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        requests.push(
          this.productService.getAll({ ...this.filter, categoryId: child.id })
        );
      });
    }

    // ✅ استنى كل الـ requests تخلص
    forkJoin(requests).subscribe({
      next: (responses) => {
        // ✅ اجمع كل الـ products من كل الـ responses
        let allProducts: ProductList[] = [];
        let totalCount = 0;

        responses.forEach((res: any) => {
          if (res.success) {
            allProducts = allProducts.concat(res.data);
            totalCount += res.pagination.totalCount;
          }
        });

        // ✅ امسح الـ duplicates لو موجودة
        const uniqueProducts = Array.from(
          new Map(allProducts.map(p => [p.id, p])).values()
        );

        this.products = uniqueProducts;
        this.totalCount = totalCount;

        // ✅ احسب الـ pagination يدوياً
        this.totalPages = Math.ceil(totalCount / (this.filter.pageSize || 9));
        this.currentPage = this.filter.page || 1;
        this.hasPrev = this.currentPage > 1;
        this.hasNext = this.currentPage < this.totalPages;

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onBrandChange(brandId: number | null): void {
    this.filter.brandId = brandId || undefined;
    this.filter.page = 1;
    this.updateUrl();
    this.loadProducts();
  }

  onPriceFilter(): void {
    this.filter.minPrice = this.minPrice || undefined;
    this.filter.maxPrice = this.maxPrice || undefined;
    this.filter.page = 1;
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
    this.filter.page = 1;
    this.loadProducts();
  }

  onInStockChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.filter.inStock = checkbox.checked || undefined;
    this.filter.page = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.filter = {
      page: 1,
      pageSize: 8,
      sortBy: 'newest',
      sortDesc: true
    };
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedSort = 'newest';
    this.expandedCategories.clear();
    this.router.navigate(['/products']);
    this.loadProducts();
  }

  loadMore(): void {
    if (this.hasMore && !this.isLoadingMore) {
      this.filter.page = (this.filter.page || 1) + 1;
      this.loadProducts();
    }
  }

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  updateUrl(): void {
    const queryParams: any = {};

    if (this.filter.categoryId) queryParams.category = this.filter.categoryId;
    if (this.filter.brandId) queryParams.brand = this.filter.brandId;
    if (this.filter.search) queryParams.search = this.filter.search;

    this.router.navigate(['/products'], { queryParams });
  }

  getName(item: any): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : item.nameEn;
  }

  getDescription(item: any): string {
    return this.i18n.currentLang === 'ar' ? item.descriptionAr : item.descriptionEn;
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
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP');
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
    document.body.style.overflow = this.showMobileFilters ? 'hidden' : '';
  }

  getSelectedCategoryName(): string {
    const info = this.getSelectedCategoryInfo();
    if (!info) return '';
    return info.isChild ? `${info.parentName} > ${info.name}` : info.name;
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

  trackByCategory(index: number, category: Category): number {
    return category.id;
  }

  // ═══════════════════════════════════════════════
  // CART
  // ═══════════════════════════════════════════════

  addToCart(product: ProductList, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first',
        'error'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    if (product.stock <= 0) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'المنتج غير متوفر' : 'Product out of stock',
        'error'
      );
      return;
    }

    this.cartService.addItem(product.id, 1).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم إضافة المنتج للسلة' : 'Added to cart',
            'success'
          );
        } else {
          this.showToast(res.message || 'Error', 'error');
        }
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
      }
    });
  }

  // ═══════════════════════════════════════════════
  // DIALOGS
  // ═══════════════════════════════════════════════

  openAddDialog(): void {
    this.resetForm();
    this.showAddDialog = true;
  }

  openEditDialog(product: ProductList): void {
    this.selectedProduct = product;
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
          this.imagesPreview = p.images?.map((img: string) => this.getImageUrl(img)) || [];
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
        this.cdr.detectChanges();
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

  async createProduct(): Promise<void> {
    if (!this.validateForm()) return;

    this.isSubmitting = true;

    try {
      let mainImageUrl = this.productForm.mainImage;
      if (this.selectedMainImage) {
        const res = await this.productService.uploadImage(this.selectedMainImage).toPromise();
        if (res?.success) {
          mainImageUrl = res.data;
        }
      }

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
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
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

  // ═══════════════════════════════════════════════
  // BRAND BANNER
  // ═══════════════════════════════════════════════

  onBrandBannerSelect(brand: Brand): void {
    if (this.selectedBrandId === brand.id) {
      this.selectedBrand = null;
      this.selectedBrandId = null;
      this.brandBestSellers = [];
      this.brandCategories = [];
      this.selectedBrandCategoryId = null;
      return;
    }
    this.selectedBrand = brand;
    this.selectedBrandId = brand.id;
    this.selectedBrandCategoryId = null;
    this.loadBrandBestSellers();
  }

  onBrandCategorySelect(categoryId: number | null): void {
    this.selectedBrandCategoryId = categoryId;
    this.loadBrandBestSellers();
  }

  loadBrandBestSellers(): void {
    if (!this.selectedBrandId) return;
    this.isBrandLoading = true;

    const filter: ProductFilter = {
      page: 1,
      pageSize: 12,
      sortBy: 'sales',
      sortDesc: true,
      brandId: this.selectedBrandId,
      categoryId: this.selectedBrandCategoryId || undefined
    };

    this.productService.getAll(filter).subscribe({
      next: (res) => {
        if (res.success) {
          this.brandBestSellers = res.data;

          const catMap = new Map<number, Category>();
          res.data.forEach((p: any) => {
            if (p.categoryId && p.categoryNameAr) {
              catMap.set(p.categoryId, {
                id: p.categoryId,
                nameAr: p.categoryNameAr,
                nameEn: p.categoryNameEn || p.categoryNameAr,
                productCount: 0
              } as Category);
            }
          });
          this.brandCategories = Array.from(catMap.values());
        }
        this.isBrandLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isBrandLoading = false; }
    });
  }

  getBrandImage(brand: Brand): string {
    if (!brand?.logo) return this.brandPlaceholder;
    if (brand.logo.startsWith('http') || brand.logo.startsWith('data:')) return brand.logo;
    return `${environment.baseApi}${brand.logo}`;
  }

  handleBrandImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.brandPlaceholder;
  }
}