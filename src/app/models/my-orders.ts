export enum OrderStatus {
   Pending = 0,
  VendorSeen = 1,
  Confirmed = 2,
  Processing = 3,
  Shipped = 4,
  OutForDelivery = 5,
  Delivered = 6,
  DeliveryFailed = 7,
  Cancelled = 8,
  Returned = 9
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Refunded = 3
}

export enum ShipmentStatus {
  Pending = 0,
  Processing = 1,
  PartiallyPicked = 2,
  ReadyForPickup = 3,
  OutForDelivery = 4,
  Delivered = 5,
  Cancelled = 6
}

export interface OrderItem {
  id: number;
  productId: number;
  productNameAr: string;
  productNameEn: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  total: number;
  vendorId?: string;
  vendorName?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingNotes?: string;
  subTotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryAgentId?: string;
  deliveryAgentName?: string;
  createdAt: Date;
  deliveredAt?: Date;
  items: OrderItem[];

  shipmentBarcode?: string;
  shipmentStatus?: ShipmentStatus;
  shipmentStatusAr?: string;
  isReadyForPickup?: boolean;
  vendorOrdersCount?: number;
  completedVendorOrders?: number;
}

export interface OrderListItem {
  id: number;
  orderNumber: string;
  customerName?: string;
  itemsCount: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CreateOrderDto {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingNotes?: string;
  paymentMethod?: string; // 'COD' or 'Visa'
}