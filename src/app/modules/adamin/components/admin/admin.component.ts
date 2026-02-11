import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminDashboard, AdminUser, InventoryReport, SalesReportFilter, SalesReportSummary, UserFilter } from '../../../../models/adminDashboard';
import { I18nService } from '../../../../core/services/i18n.service';
import { AdminReportsService } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  // Active Tab
  activeTab: 'dashboard' | 'users' | 'sales' | 'inventory' = 'dashboard';

  // Loading States
  isLoading = false;
  isLoadingUsers = false;
  isLoadingSales = false;
  isLoadingInventory = false;

  // Dashboard Data
  dashboard: AdminDashboard | null = null;

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
  roles = ['Admin', 'Vendor', 'Customer', 'DeliveryAgent'];

  constructor(
    public i18n: I18nService,
    private adminService: AdminReportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ═══════════════════════════════════════════════
  // TAB SWITCHING
  // ═══════════════════════════════════════════════
  switchTab(tab: 'dashboard' | 'users' | 'sales' | 'inventory'): void {
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
    this.adminService.changeUserRole(this.selectedUser.id, this.selectedRole).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم تغيير الدور' : 'Role changed', 'success');
          this.loadUsers();
          this.closeRoleDialog();
        }
        this.isProcessing = false;
      },
      error: () => {
        this.isProcessing = false;
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error changing role', 'error');
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
    return price.toLocaleString() + (this.i18n.currentLang === 'ar' ? ' ر.س' : ' SAR');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.i18n.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString(this.i18n.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
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
}
