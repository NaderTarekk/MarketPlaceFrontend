// ==================== Enums ====================
export enum ShipmentStatus {
  Pending = 0,
  Processing = 1,
  PartiallyPicked = 2,
  ReadyForPickup = 3,
  OutForDelivery = 4,
  Delivered = 5,
  Cancelled = 6
}

export enum VendorOrderStatus {
  Pending = 0,
  Assigned = 1,
  PickedFromVendor = 2,
  InWarehouse = 3,
  OutForDelivery = 4,
  Delivered = 5,
  Cancelled = 6
}

export enum DeliveryType {
  ToWarehouse = 0,
  DirectToCustomer = 1
}

// ==================== Shipment ====================
export interface ShipmentListItem {
  id: number;
  shipmentBarcode: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  vendorOrdersCount: number;
  completedVendorOrders: number;
  status: ShipmentStatus;
  statusAr: string;
  isReadyForPickup: boolean;
  hasDeliveryFailure: boolean;
  createdAt: Date;
  deliveryType?: number;
  pickupPointNameAr?: string;
  pickupPointNameEn?: string;
  pickupPointAddressAr?: string;
  pickupPointAddressEn?: string;
}

export interface ShipmentDetails {
  id: number;
  shipmentBarcode: string;
  orderId: number;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  status: ShipmentStatus;
  statusAr: string;
  isReadyForPickup: boolean;
  createdAt: Date;
  completedAt?: Date;
  deliveryType?: number;
  pickupPointNameAr?: string;
  pickupPointNameEn?: string;
  pickupPointAddressAr?: string;
  pickupPointAddressEn?: string;
  totalAmount: number;
  vendorOrders: VendorOrder[];
}

// ==================== VendorOrder ====================
export interface VendorOrder {
  id: number;
  vendorOrderBarcode: string;
  shipmentId: number;
  vendorId: string;
  vendorName: string;
  vendorPhone?: string;
  vendorAddress?: string;
  deliveryAgentId?: string;
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
  deliveryType: DeliveryType;
  deliveryTypeAr: string;
  status: VendorOrderStatus;
  statusAr: string;
  createdAt: Date;
  pickedAt?: Date;
  deliveredAt?: Date;
  totalAmount: number;
  items: VendorOrderItem[];
  customerName?: string;
  shippingAddress?: string;
  pickupPointNameAr?: string;
  pickupPointNameEn?: string;
  pickupPointAddressAr?: string;
  pickupPointAddressEn?: string;
}

export interface VendorOrderItem {
  id: number;
  itemBarcode: string;
  productId: number;
  productNameAr: string;
  productNameEn: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ==================== Delivery Agent ====================
export interface DeliveryAgent {
  id: string;
  fullName: string;
  phoneNumber?: string;
  activeTasksCount: number;
  completedTasksToday: number;
}

export interface DeliveryAgentTask {
  vendorOrderId: number;
  vendorOrderBarcode: string;
  shipmentBarcode: string;
  vendorName: string;
  vendorPhone?: string;
  vendorAddress?: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  deliveryType: DeliveryType;
  deliveryTypeAr: string;
  status: VendorOrderStatus;
  statusAr: string;
  isAgentHeadingToVendor: boolean;
  itemsCount: number;
  totalAmount: number;
  items: VendorOrderItem[];
  orderId: number;
}

// ==================== Vendor Pending Orders ====================
export interface VendorPendingOrder {
  vendorOrderId: number;
  vendorOrderBarcode: string;
  shipmentBarcode: string;
  customerName: string;
  shippingCity: string;
  status: VendorOrderStatus;
  statusAr: string;
  isAgentHeadingToVendor: boolean;
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
  createdAt: Date;
  itemsCount: number;
  totalAmount: number;
  items: VendorOrderItem[];
}

// ==================== DTOs ====================
export interface AssignDeliveryAgentDto {
  vendorOrderId: number;
  deliveryAgentId: string;
  deliveryType: DeliveryType;
}

export interface BulkAssignDto {
  vendorOrderIds: number[];
  deliveryAgentId: string;
  deliveryType: DeliveryType;
}

export interface ShipmentFilter {
  status?: ShipmentStatus;
  customerId?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  pageSize?: number;
}

export interface VendorOrderFilter {
  status?: VendorOrderStatus;
  vendorId?: string;
  deliveryAgentId?: string;
  deliveryType?: DeliveryType;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  pageSize?: number;
}