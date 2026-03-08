export interface VendorList {
  id: string;
  fullName: string;
  email?: string;
  businessName?: string;
  commissionRate: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingPayment: number;
  createdAt: string;
}

export interface VendorDetailedReport {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  isBanned: boolean;
  businessName?: string;
  commercialRegistration?: string;
  taxNumber?: string;
  businessAddress?: string;
  commissionRate: number;
  totalRevenue: number;
  vendorEarnings: number;
  adminEarnings: number;
  paidToVendor: number;
  pendingPayment: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topSellingProducts: TopSellingProduct[];
  orderBreakdown: VendorOrderBreakdown[];
}

export interface VendorOrderBreakdown {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  orderTotal: number;
  vendorShare: number;
  adminShare: number;
  isPaidToVendor: boolean;
  paymentDate?: string;
}

export interface DeliveryAgentList {
  id: string;
  fullName: string;
  phoneNumber?: string;
  activeOrders: number;
  completedOrders: number;
  cashPending: number;
  createdAt: string;
}

export interface DeliveryAgentReport {
  id: string;
  fullName: string;
  phoneNumber?: string;
  createdAt: string;
  isBanned: boolean;
  activeOrders: number;
  completedOrders: number;
  totalOrders: number;
  totalCashCollected: number;
  cashSettled: number;
  cashPending: number;
  lastSettlementDate?: string;
  orders: AgentOrder[];
}

export interface AgentOrder {
  vendorOrderId: number;
  vendorOrderBarcode: string;
  shipmentBarcode: string;
  customerName: string;
  amount: number;
  isCashCollected: boolean;
  isSettled: boolean;
  settlementDate?: string;
  status: number;
  statusAr: string;
}

export interface ShippingEmployeeList {
  id: string;
  fullName: string;
  phoneNumber?: string;
  activePickups: number;
  completedPickups: number;
  cashPending: number;
  createdAt: string;
}

export interface ShippingEmployeeReport {
  id: string;
  fullName: string;
  phoneNumber?: string;
  createdAt: string;
  isBanned: boolean;
  activePickups: number;
  completedPickups: number;
  totalPickups: number;
  totalCashCollected: number;
  cashSettled: number;
  cashPending: number;
  lastSettlementDate?: string;
  pickups: EmployeePickup[];
}

export interface EmployeePickup {
  shipmentId: number;
  shipmentBarcode: string;
  customerName: string;
  amount: number;
  isCashCollected: boolean;
  isSettled: boolean;
  settlementDate?: string;
  status: number;
  statusAr: string;
}

export interface FinancialReport {
  totalExpectedRevenue: number;
  adminExpectedRevenue: number;
  vendorsExpectedRevenue: number;
  totalCollectedRevenue: number;
  adminCollectedRevenue: number;
  vendorsCollectedRevenue: number;
  pendingFromDeliveryAgents: number;
  pendingFromShippingEmployees: number;
  pendingToVendors: number;
  breakdown: FinancialBreakdown[];
}

export interface FinancialBreakdown {
  source: string;
  name: string;
  expected: number;
  collected: number;
  pending: number;
}

export interface Settlement {
  id: number;
  userId: string;
  userName: string;
  userRole: string;
  amount: number;
  settlementDate: string;
  notes: string;
}

export interface CreateSettlement {
  userId: string;
  amount: number;
  notes: string;
}

export interface UpdateCommissionRate {
  commissionRate: number;
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