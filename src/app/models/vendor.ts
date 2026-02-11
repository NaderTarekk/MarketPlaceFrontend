import { ProductList } from "./products";

export interface VendorDashboard {
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  rejectedProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  totalReviews: number;
  averageRating: number;
  totalViews: number;
  thisMonthViews: number;
  recentOrders: RecentOrder[];
  topSellingProducts: ProductList[];
  lowStockProducts: ProductList[];
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItemSummary[];
}

export interface OrderItemSummary {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface SalesReport {
  date: string;
  ordersCount: number;
  revenue: number;
  productsSold: number;
}