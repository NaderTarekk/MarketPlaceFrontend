// ============================================================================
// 📁 models/return.models.ts
// ============================================================================

export enum ReturnStatus {
  Pending = 0,
  VendorApproved = 1,
  VendorRejected = 2,
  AdminApproved = 3,
  AdminRejected = 4,
  PickupScheduled = 5,
  PickedUp = 6,
  InWarehouse = 7,
  InspectionPassed = 8,
  InspectionFailed = 9,
  RefundProcessing = 10,
  RefundCompleted = 11,
  Cancelled = 12
}

export enum ReturnReason {
  DamagedProduct = 0,
  WrongProduct = 1,
  NotSatisfied = 2,
  NotAsDescribed = 3,
  Other = 99
}

export enum RefundMethod {
  Wallet = 0,
  DirectRefund = 1
}

export enum ReturnPickupType {
  CustomerDropOff = 0,
  AgentPickup = 1
}

// Status Labels
export const ReturnStatusLabels: { [key: number]: string } = {
  [ReturnStatus.Pending]: 'في انتظار موافقة التاجر',
  [ReturnStatus.VendorApproved]: 'التاجر وافق - في انتظار الإدارة',
  [ReturnStatus.VendorRejected]: 'التاجر رفض',
  [ReturnStatus.AdminApproved]: 'تمت الموافقة',
  [ReturnStatus.AdminRejected]: 'مرفوض',
  [ReturnStatus.PickupScheduled]: 'تم جدولة الاستلام',
  [ReturnStatus.PickedUp]: 'تم الاستلام',
  [ReturnStatus.InWarehouse]: 'في المخزن',
  [ReturnStatus.InspectionPassed]: 'تم الفحص - مقبول',
  [ReturnStatus.InspectionFailed]: 'تم الفحص - مرفوض',
  [ReturnStatus.RefundProcessing]: 'جاري الاسترداد',
  [ReturnStatus.RefundCompleted]: 'تم الاسترداد',
  [ReturnStatus.Cancelled]: 'ملغي'
};

export const ReturnReasonLabels: { [key: number]: string } = {
  [ReturnReason.DamagedProduct]: 'منتج تالف',
  [ReturnReason.WrongProduct]: 'منتج غلط',
  [ReturnReason.NotSatisfied]: 'غير راضي عن المنتج',
  [ReturnReason.NotAsDescribed]: 'لم يطابق الوصف',
  [ReturnReason.Other]: 'سبب آخر'
};

// Interfaces
export interface ReturnRequestList {
  id: number;
  returnBarcode: string;
  orderNumber: string;
  customerName: string;
  reason: ReturnReason;
  reasonAr: string;
  status: ReturnStatus;
  statusAr: string;
  itemsCount: number;
  totalAmount: number;
  createdAt: Date;
  needsVendorAction: boolean;
  needsAdminAction: boolean;
}

export interface ReturnRequestDetails {
  id: number;
  returnBarcode: string;
  orderId: number;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  reason: ReturnReason;
  reasonAr: string;
  reasonDetails?: string;
  images: string[];
  status: ReturnStatus;
  statusAr: string;
  vendorApproval?: boolean;
  vendorNotes?: string;
  vendorResponseAt?: Date;
  adminApproval?: boolean;
  adminNotes?: string;
  adminName?: string;
  adminResponseAt?: Date;
  pickupType?: ReturnPickupType;
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
  scheduledPickupDate?: Date;
  pickedUpAt?: Date;
  receivedInWarehouseAt?: Date;
  inspectionPassed?: boolean;
  inspectionNotes?: string;
  inspectedAt?: Date;
  refundMethod?: RefundMethod;
  refundAmount: number;
  shippingDeduction: number;
  totalRefund: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: ReturnItemDetails[];
}

export interface ReturnItemDetails {
  id: number;
  orderItemId: number;
  productId: number;
  productNameAr: string;
  productNameEn: string;
  productImage: string;
  variantInfo?: string;
  quantity: number;
  originalQuantity: number;
  unitPrice: number;
  total: number;
  vendorId: string;
  vendorName: string;
  itemInspectionPassed?: boolean;
  itemInspectionNotes?: string;
  returnedToStock: boolean;
}

export interface VendorReturn {
  id: number;
  returnBarcode: string;
  orderNumber: string;
  customerName: string;
  reason: ReturnReason;
  reasonAr: string;
  reasonDetails?: string;
  images: string[];
  status: ReturnStatus;
  statusAr: string;
  totalAmount: number;
  createdAt: Date;
  canRespond: boolean;
  items: ReturnItemDetails[];
}

export interface ReturnPickupTask {
  returnRequestId: number;
  returnBarcode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  scheduledPickupDate: Date;
  itemsCount: number;
  status: ReturnStatus;
  statusAr: string;
}

export interface ReturnStatistics {
  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  rejectedReturns: number;
  completedReturns: number;
  totalRefundedAmount: number;
  averageProcessingDays: number;
  reasonBreakdown: { [key: number]: number };
}

// Request DTOs
export interface CreateReturnRequest {
  orderId: number;
  reason: ReturnReason;
  reasonDetails?: string;
  images?: string[];
  items: { orderItemId: number; quantity: number }[];
}

export interface VendorReturnResponse {
  returnRequestId: number;
  approved: boolean;
  notes?: string;
}

export interface AdminReturnResponse {
  returnRequestId: number;
  approved: boolean;
  notes?: string;
  pickupType?: ReturnPickupType;
  scheduledPickupDate?: Date;
}

export interface AssignReturnAgent {
  returnRequestId: number;
  deliveryAgentId: string;
  scheduledPickupDate: Date;
}

export interface ReturnInspection {
  returnRequestId: number;
  passed: boolean;
  notes?: string;
  itemsInspection?: ItemInspection[];
}

export interface ItemInspection {
  returnItemId: number;
  passed: boolean;
  notes?: string;
  returnToStock: boolean;
}

export interface ProcessRefund {
  returnRequestId: number;
  method: RefundMethod;
  customRefundAmount?: number;
}

export interface ReturnFilter {
  status?: ReturnStatus;
  customerId?: string;
  vendorId?: string;
  reason?: ReturnReason;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  pageSize: number;
}