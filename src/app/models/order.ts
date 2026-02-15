export interface CreateOrderDto {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingNotes?: string;
  paymentMethod?: string;
}