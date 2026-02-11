export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  rejectedProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  averageOrderValue: number;
  totalReviews: number;
  averageRating: number;
  totalPromoCodes: number;
  activePromoCodes: number;
  totalDiscountGiven: number;
  recentActivities: RecentActivity[];
  topSellingProducts: TopSellingProduct[];
  topVendors: TopVendor[];
  revenueChart: RevenueChart[];
}

export interface RecentActivity {
  type: string;
  message: string;
  messageAr: string;
  createdAt: string;
  icon?: string;
  color?: string;
}

export interface TopSellingProduct {
  id: number;
  nameAr: string;
  nameEn: string;
  mainImage?: string;
  price: number;
  totalSold: number;
  totalRevenue: number;
}

export interface TopVendor {
  id: string;
  fullName: string;
  email?: string;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface RevenueChart {
  date: string;
  revenue: number;
  orders: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
  totalReviews: number;
  totalProducts?: number;
  totalEarnings?: number;
}

export interface UserFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

export interface SalesReportFilter {
  from?: string;
  to?: string;
  groupBy?: string;
  vendorId?: string;
  categoryId?: number;
}

export interface SalesReport {
  period: string;
  date: string;
  ordersCount: number;
  productsSold: number;
  revenue: number;
  discount: number;
  netRevenue: number;
  averageOrderValue: number;
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalDiscount: number;
  netRevenue: number;
  totalOrders: number;
  totalProductsSold: number;
  averageOrderValue: number;
  growthPercentage: number;
  data: SalesReport[];
}

export interface InventoryReport {
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  items: InventoryItem[];
}

export interface InventoryItem {
  id: number;
  nameAr: string;
  nameEn: string;
  mainImage?: string;
  sku?: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  costPrice: number;
  stockValue: number;
  status: string;
  vendorName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PagedResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}