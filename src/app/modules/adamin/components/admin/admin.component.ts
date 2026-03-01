import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminDashboard, AdminUser, InventoryReport, SalesReportFilter, SalesReportSummary, UserFilter } from '../../../../models/adminDashboard';
import { I18nService } from '../../../../core/services/i18n.service';
import { AdminReportsService } from '../../services/admin.service';
import { ProductsService } from '../../../products/services/products.service';
import { ProductList } from '../../../../models/products';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  // Active Tab
  activeTab: 'dashboard' | 'users' | 'sales' | 'inventory' | 'products' = 'dashboard';

  // Loading States
  isLoading = false;
  isLoadingUsers = false;
  isLoadingSales = false;
  isLoadingInventory = false;
  pendingVendorRequests: any[] = [];
  isLoadingPendingVendors = false;

  // Dashboard Data
  dashboard: AdminDashboard | null = null;

  pendingProducts: ProductList[] = [];
  isLoadingProducts = false;
  productsPagination = {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  };
  selectedProduct: ProductList | null = null;
  showProductModal = false;
  showRejectDialog = false;
  rejectReason = '';

  // Users Data
  users: AdminUser[] = [];
  userFilter: UserFilter = {
    page: 1,
    pageSize: 10,
    search: '',
    role: 'All',
    status: 'All',
    sortBy: 'newest',
    sortDesc: true
  };
  usersPagination = {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  };

  // Sales Data
  salesReport: SalesReportSummary | null = null;
  salesFilter: SalesReportFilter = {
    from: this.getDateBefore(30),
    to: this.getToday(),
    groupBy: 'day'
  };

  // Inventory Data
  inventoryReport: InventoryReport | null = null;
  inventoryFilter = {
    status: 'All',
    search: ''
  };

  // Dialogs
  showUserDialog = false;
  showBanDialog = false;
  showDeleteDialog = false;
  showRoleDialog = false;
  selectedUser: AdminUser | null = null;
  banReason = '';
  banReasonAr = '';
  selectedRole = '';
  isProcessing = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // Roles
  roles = [
    { value: 'Admin', labelAr: 'مدير النظام', labelEn: 'Admin' },
    { value: 'Vendor', labelAr: 'بائع', labelEn: 'Vendor' },
    { value: 'Customer', labelAr: 'عميل', labelEn: 'Customer' },
    { value: 'DeliveryAgent', labelAr: 'مندوب توصيل', labelEn: 'Delivery Agent' },
    { value: 'CustomerService', labelAr: 'خدمة العملاء', labelEn: 'Customer Service' },
    { value: 'ShippingEmployee', labelAr: 'موظف الشحن', labelEn: 'Shipping Employee' }
  ];


  constructor(
    public i18n: I18nService,
    private adminService: AdminReportsService,
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadPendingVendorRequests();
  }

  loadPendingVendorRequests(): void {
    this.isLoadingPendingVendors = true;
    this.adminService.getPendingVendorRequests().subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingVendorRequests = res.data;
        }
        this.isLoadingPendingVendors = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingPendingVendors = false;
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ في تحميل الطلبات' : 'Error loading requests',
          'error'
        );
      }
    });
  }

  // Approve Vendor
  approveVendor(userId: string): void {
    this.adminService.approveVendorUpgrade(userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم قبول الطلب بنجاح' : 'Request approved',
            'success'
          );
          this.loadPendingVendorRequests();
          this.loadDashboard();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error approving request',
          'error'
        );
      }
    });
  }

  // Reject Vendor
  rejectVendor(userId: string): void {
    if (!confirm(this.i18n.currentLang === 'ar' ? 'هل أنت متأكد من رفض الطلب؟' : 'Reject this request?')) {
      return;
    }

    this.adminService.rejectVendorUpgrade(userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم رفض الطلب' : 'Request rejected',
            'success'
          );
          this.loadPendingVendorRequests();
        }
      },
      error: () => {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error rejecting request',
          'error'
        );
      }
    });
  }
  // ═══════════════════════════════════════════════
  // TAB SWITCHING
  // ═══════════════════════════════════════════════
  switchTab(tab: 'dashboard' | 'users' | 'sales' | 'inventory' | 'products'): void {
    this.activeTab = tab;

    switch (tab) {
      case 'dashboard':
        if (!this.dashboard) this.loadDashboard();
        break;
      case 'users':
        if (this.users.length === 0) this.loadUsers();
        break;
      case 'sales':
        if (!this.salesReport) this.loadSalesReport();
        break;
      case 'inventory':
        if (!this.inventoryReport) this.loadInventoryReport();
        break;
      case 'products':
        if (this.pendingProducts.length === 0) this.loadPendingProducts();
        break;
    }
  }

  // ═══════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════
  loadDashboard(): void {
    this.isLoading = true;
    this.adminService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboard = res.data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error loading dashboard', 'error');
      }
    });
  }

  // ═══════════════════════════════════════════════
  // USERS MANAGEMENT
  // ═══════════════════════════════════════════════
  loadUsers(): void {
    this.isLoadingUsers = true;
    this.adminService.getUsers(this.userFilter).subscribe({
      next: (res) => {
        if (res.success) {
          this.users = res.data;
          this.usersPagination = {
            currentPage: res.pagination.currentPage,
            totalPages: res.pagination.totalPages,
            totalCount: res.pagination.totalCount,
            hasNext: res.pagination.hasNext,
            hasPrevious: res.pagination.hasPrevious
          };
        }
        this.isLoadingUsers = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingUsers = false;
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error loading users', 'error');
      }
    });
  }

  onUserSearch(event: Event): void {
    this.userFilter.search = (event.target as HTMLInputElement).value;
    this.userFilter.page = 1;
    this.loadUsers();
  }

  onUserFilterChange(): void {
    this.userFilter.page = 1;
    this.loadUsers();
  }

  goToUserPage(page: number): void {
    this.userFilter.page = page;
    this.loadUsers();
  }

  // User Actions
  openUserDialog(user: AdminUser): void {
    this.selectedUser = { ...user };
    this.showUserDialog = true;
  }

  closeUserDialog(): void {
    this.showUserDialog = false;
    this.selectedUser = null;
  }

  saveUser(): void {
    if (!this.selectedUser) return;

    this.isProcessing = true;
    this.adminService.updateUser(this.selectedUser.id, {
      fullName: this.selectedUser.fullName,
      email: this.selectedUser.email,
      phoneNumber: this.selectedUser.phoneNumber
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم تحديث المستخدم' : 'User updated', 'success');
          this.loadUsers();
          this.closeUserDialog();
        }
        this.isProcessing = false;
      },
      error: () => {
        this.isProcessing = false;
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error updating user', 'error');
      }
    });
  }

  // Ban User
  openBanDialog(user: AdminUser): void {
    this.selectedUser = user;
    this.banReason = '';
    this.banReasonAr = '';
    this.showBanDialog = true;
  }

  closeBanDialog(): void {
    this.showBanDialog = false;
    this.selectedUser = null;
    this.banReason = '';
    this.banReasonAr = '';
  }

  confirmBan(): void {
    if (!this.selectedUser || !this.banReason) return;

    this.isProcessing = true;
    this.adminService.banUser(this.selectedUser.id, this.banReason, this.banReasonAr).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم حظر المستخدم' : 'User banned', 'success');
          this.loadUsers();
          this.closeBanDialog();
        }
        this.isProcessing = false;
      },
      error: () => {
        this.isProcessing = false;
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error banning user', 'error');
      }
    });
  }

  unbanUser(user: AdminUser): void {
    this.adminService.unbanUser(user.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم إلغاء الحظر' : 'User unbanned', 'success');
          this.loadUsers();
        }
      },
      error: () => {
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error unbanning user', 'error');
      }
    });
  }

  // Delete User
  openDeleteDialog(user: AdminUser): void {
    this.selectedUser = user;
    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.selectedUser = null;
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;

    this.isProcessing = true;
    this.adminService.deleteUser(this.selectedUser.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم حذف المستخدم' : 'User deleted', 'success');
          this.loadUsers();
          this.closeDeleteDialog();
        }
        this.isProcessing = false;
      },
      error: () => {
        this.isProcessing = false;
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error deleting user', 'error');
      }
    });
  }

  // Change Role
  openRoleDialog(user: AdminUser): void {
    this.selectedUser = user;
    this.selectedRole = user.role;
    this.showRoleDialog = true;
  }

  closeRoleDialog(): void {
    this.showRoleDialog = false;
    this.selectedUser = null;
    this.selectedRole = '';
  }

  confirmRoleChange(): void {
    if (!this.selectedUser || !this.selectedRole) return;

    this.isProcessing = true;

    // ✅ بعت object مش string
    const payload = { role: this.selectedRole };

    this.adminService.changeUserRole(this.selectedUser.id, payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم تغيير الدور' : 'Role changed',
            'success'
          );
          this.loadUsers();
          this.closeRoleDialog();
        }
        this.isProcessing = false;
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Role change error:', err); // ← شوف الـ error details
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error changing role',
          'error'
        );
      }
    });
  }

  // ═══════════════════════════════════════════════
  // SALES REPORT
  // ═══════════════════════════════════════════════
  loadSalesReport(): void {
    this.isLoadingSales = true;
    this.adminService.getSalesReport(this.salesFilter).subscribe({
      next: (res) => {
        if (res.success) {
          this.salesReport = res.data;
        }
        this.isLoadingSales = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingSales = false;
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error loading sales report', 'error');
      }
    });
  }

  onSalesFilterChange(): void {
    this.loadSalesReport();
  }

  // ═══════════════════════════════════════════════
  // INVENTORY REPORT
  // ═══════════════════════════════════════════════
  loadInventoryReport(): void {
    this.isLoadingInventory = true;
    this.adminService.getInventoryReport().subscribe({
      next: (res) => {
        if (res.success) {
          this.inventoryReport = res.data;
        }
        this.isLoadingInventory = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingInventory = false;
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error loading inventory', 'error');
      }
    });
  }

  getFilteredInventory(): any[] {
    if (!this.inventoryReport) return [];

    let items = this.inventoryReport.items;

    if (this.inventoryFilter.status !== 'All') {
      items = items.filter(i => i.status === this.inventoryFilter.status);
    }

    if (this.inventoryFilter.search) {
      const search = this.inventoryFilter.search.toLowerCase();
      items = items.filter(i =>
        i.nameAr.toLowerCase().includes(search) ||
        i.nameEn.toLowerCase().includes(search) ||
        (i.sku && i.sku.toLowerCase().includes(search))
      );
    }

    return items;
  }

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════
  formatPrice(price: number): string {
    return price.toLocaleString() + (this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString(this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDateBefore(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  getProductImage(image?: string): string {
    if (!image) return 'assets/images/placeholder.png';
    if (image.startsWith('http')) return image;
    return `http://localhost:5078${image}`;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'Admin': return 'badge-admin';
      case 'Vendor': return 'badge-vendor';
      case 'DeliveryAgent': return 'badge-delivery';
      case 'ShippingEmployee': return 'badge-shipping-employee';
      case 'CustomerService': return 'badge-customer-service';
      default: return 'badge-customer';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'InStock': return 'badge-success';
      case 'LowStock': return 'badge-warning';
      case 'OutOfStock': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  trackByUser(index: number, user: AdminUser): string {
    return user.id;
  }

  trackByItem(index: number, item: any): number {
    return item.id;
  }

  // ═══════════════════════════════════════════════
  // PENDING PRODUCTS
  // ═══════════════════════════════════════════════

  loadPendingProducts(page: number = 1): void {
    this.isLoadingProducts = true;
    this.productsService.getPendingProducts(page, 10).subscribe({
      next: (res) => {
        if (res.success) {
          this.pendingProducts = res.data;
          this.productsPagination = {
            currentPage: res.pagination.currentPage,
            totalPages: res.pagination.totalPages,
            totalCount: res.pagination.totalCount,
            hasNext: res.pagination.hasNext,
            hasPrevious: res.pagination.hasPrevious
          };
        }
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProducts = false;
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ في تحميل المنتجات' : 'Error loading products',
          'error'
        );
      }
    });
  }

  goToProductsPage(page: number): void {
    this.loadPendingProducts(page);
  }

  openProductModal(product: ProductList): void {
    this.selectedProduct = product;
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
  }

  approveProduct(product: ProductList): void {
    this.productsService.approveProduct(product.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم قبول المنتج بنجاح' : 'Product approved',
            'success'
          );
          this.loadPendingProducts(this.productsPagination.currentPage);
          this.loadDashboard(); // تحديث الـ dashboard
          this.closeProductModal();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error approving product',
          'error'
        );
      }
    });
  }

  openRejectDialog(product: ProductList): void {
    this.selectedProduct = product;
    this.rejectReason = '';
    this.showRejectDialog = true;
  }

  closeRejectDialog(): void {
    this.showRejectDialog = false;
    this.selectedProduct = null;
    this.rejectReason = '';
  }

  confirmRejectProduct(): void {
    if (!this.selectedProduct) return;

    this.productsService.rejectProduct(this.selectedProduct.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم رفض المنتج' : 'Product rejected',
            'success'
          );
          this.loadPendingProducts(this.productsPagination.currentPage);
          this.loadDashboard();
          this.closeRejectDialog();
          this.closeProductModal();
        }
      },
      error: () => {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error rejecting product',
          'error'
        );
      }
    });
  }

  // ═══════════════════════════════════════════════
  // INVENTORY ACTIONS
  // ═══════════════════════════════════════════════

  // Toggle Product Visibility
  toggleProductVisibility(product: any): void {
    const newStatus = product.isActive ? false : true;
    this.productsService.update(product.id, { isActive: newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          product.isActive = newStatus;
          this.showToast(
            this.i18n.currentLang === 'ar'
              ? (newStatus ? 'تم إظهار المنتج' : 'تم إخفاء المنتج')
              : (newStatus ? 'Product visible' : 'Product hidden'),
            'success'
          );
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error updating product',
          'error'
        );
      }
    });
  }

  // Edit Product Dialog
  showEditProductDialog = false;
  editingProduct: any = null;

  openEditProductDialog(product: any): void {
    this.editingProduct = { ...product };
    this.showEditProductDialog = true;
  }

  closeEditProductDialog(): void {
    this.showEditProductDialog = false;
    this.editingProduct = null;
  }

  saveProductChanges(): void {
    if (!this.editingProduct) return;

    this.isProcessing = true;
    this.productsService.update(this.editingProduct.id, {
      nameAr: this.editingProduct.nameAr,
      nameEn: this.editingProduct.nameEn,
      price: this.editingProduct.price,
      stock: this.editingProduct.stock,
      isActive: this.editingProduct.isActive
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم تحديث المنتج' : 'Product updated',
            'success'
          );
          this.loadInventoryReport();
          this.closeEditProductDialog();
        }
        this.isProcessing = false;
      },
      error: () => {
        this.isProcessing = false;
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error updating product',
          'error'
        );
      }
    });
  }

  // Delete Product
  showDeleteProductDialog = false;
  deletingProduct: any = null;

  openDeleteProductDialog(product: any): void {
    this.deletingProduct = product;
    this.showDeleteProductDialog = true;
  }

  closeDeleteProductDialog(): void {
    this.showDeleteProductDialog = false;
    this.deletingProduct = null;
  }

  confirmDeleteProduct(): void {
    if (!this.deletingProduct) return;

    this.isProcessing = true;
    this.productsService.delete(this.deletingProduct.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم حذف المنتج' : 'Product deleted',
            'success'
          );
          this.loadInventoryReport();
          this.loadDashboard();
          this.closeDeleteProductDialog();
        }
        this.isProcessing = false;
      },
      error: () => {
        this.isProcessing = false;
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error deleting product',
          'error'
        );
      }
    });
  }
}
