import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from '../../../../core/services/i18n.service';

type AdminTabKey =
  | 'dashboard' | 'users' | 'inventory' | 'products' | 'vendors' | 'agents'
  | 'employees' | 'financial' | 'withdrawals' | 'settings' | 'pickupPoints'
  | 'promoCodes' | 'promotions' | 'orders' | 'support';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed: boolean = (() => {
    try { return localStorage.getItem('adminSidebarCollapsed') === '1'; } catch { return false; }
  })();
  sidebarMobileOpen = false;

  // Currently active tab in the main dashboard (mirrored to ?tab= query param)
  activeTab: AdminTabKey = 'dashboard';
  // Which sub-route path segment we're on (used to highlight external items)
  activeSubRoute = '';

  constructor(
    public i18n: I18nService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.syncFromUrl();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.syncFromUrl());
  }

  private syncFromUrl(): void {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter(Boolean);
    // segments[0] = 'admin'
    this.activeSubRoute = segments[1] || '';

    if (!this.activeSubRoute) {
      const q = this.route.snapshot.queryParamMap.get('tab');
      this.activeTab = (q as AdminTabKey) || 'dashboard';
    } else {
      this.activeTab = '' as AdminTabKey;
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    try { localStorage.setItem('adminSidebarCollapsed', this.sidebarCollapsed ? '1' : '0'); } catch { }
  }

  toggleSidebarMobile(): void {
    this.sidebarMobileOpen = !this.sidebarMobileOpen;
  }

  // Navigate to /admin with query param for a dashboard tab
  goToTab(tab: AdminTabKey): void {
    this.sidebarMobileOpen = false;
    this.router.navigate(['/admin'], { queryParams: { tab } });
  }

  // For active-state on tab items — only true when we're on the /admin index route
  isTabActive(tab: AdminTabKey): boolean {
    return !this.activeSubRoute && this.activeTab === tab;
  }

  isRouteActive(segment: string): boolean {
    return this.activeSubRoute === segment;
  }

  // Human-readable label for the topbar
  get topbarLabel(): { ar: string; en: string; icon: string } {
    const routeLabels: Record<string, { ar: string; en: string; icon: string }> = {
      complaints: { ar: 'الشكاوى', en: 'Complaints', icon: 'fa-triangle-exclamation' },
      banners: { ar: 'البنرات', en: 'Banners', icon: 'fa-image' },
      returns: { ar: 'المرتجعات', en: 'Returns', icon: 'fa-rotate-left' },
      'return-statistics': { ar: 'إحصاءات المرتجعات', en: 'Return Statistics', icon: 'fa-chart-pie' },
      governorates: { ar: 'المحافظات', en: 'Governorates', icon: 'fa-map-pin' },
      categories: { ar: 'الأقسام', en: 'Categories', icon: 'fa-shapes' },
      brands: { ar: 'الماركات', en: 'Brands', icon: 'fa-copyright' }
    };
    if (this.activeSubRoute && routeLabels[this.activeSubRoute]) {
      return routeLabels[this.activeSubRoute];
    }
    const tabLabels: Record<string, { ar: string; en: string; icon: string }> = {
      dashboard: { ar: 'نظرة عامة', en: 'Overview', icon: 'fa-gauge-high' },
      users: { ar: 'المستخدمين', en: 'Users', icon: 'fa-users' },
      products: { ar: 'المنتجات المعلقة', en: 'Pending Products', icon: 'fa-boxes-stacked' },
      vendors: { ar: 'التجار', en: 'Vendors', icon: 'fa-store' },
      agents: { ar: 'المناديب', en: 'Delivery Agents', icon: 'fa-truck' },
      employees: { ar: 'موظفي الشحن', en: 'Shipping Employees', icon: 'fa-warehouse' },
      financial: { ar: 'التقارير المالية', en: 'Financial', icon: 'fa-chart-pie' },
      inventory: { ar: 'المخزون', en: 'Inventory', icon: 'fa-warehouse' },
      withdrawals: { ar: 'سحوبات التجار', en: 'Withdrawals', icon: 'fa-money-bill-transfer' },
      orders: { ar: 'الطلبات', en: 'Orders', icon: 'fa-receipt' },
      support: { ar: 'الدعم الفني', en: 'Support', icon: 'fa-headset' },
      settings: { ar: 'الإعدادات', en: 'Settings', icon: 'fa-gear' },
      pickupPoints: { ar: 'نقاط الاستلام', en: 'Pickup Points', icon: 'fa-map-location-dot' },
      promoCodes: { ar: 'أكواد الخصم', en: 'Promo Codes', icon: 'fa-ticket' },
      promotions: { ar: 'العروض', en: 'Promotions', icon: 'fa-bullhorn' }
    };
    return tabLabels[this.activeTab] || tabLabels['dashboard'];
  }
}
