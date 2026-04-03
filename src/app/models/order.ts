export interface SiteSettings {
  isPickupAvailable: boolean;
  vodafoneCashNumber?: string;
  vodafoneCashName?: string;
}

export interface CreateOrderDto {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingNotes?: string;
  paymentMethod?: string;
  governorateId?: number;  // ✅ NEW
  promoCode?: string;
  deliveryType: number;
}

export interface CancelOrderDto {
  reason?: string;
}

export interface ReportDeliveryFailureDto {
  orderId: number;
  reason: number;
  otherReason?: string;
}

export interface SetCustomerChoiceDto {
  failureId: number;
  customerChoice: number;
  customerNotes?: string;
}