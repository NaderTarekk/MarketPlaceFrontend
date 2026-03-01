

export interface DeliveryFailure {
  id: number;
  orderId: number;
  orderNumber: string;
  reportedByName: string;
  reason: string;
  reasonAr: string;
  otherReason?: string;
  customerChoice?: string;
  customerChoiceAr?: string;
  customerNotes?: string;
  isResolved: boolean;
  createdAt: Date;
}

export interface ReportDeliveryFailure {
  orderId: number;
  reason: number; // DeliveryFailureReason enum value
  otherReason?: string;
}

export interface SetCustomerChoice {
  failureId: number;
  customerChoice: number; // DeliveryOption enum value
  customerNotes?: string;
}

export interface FailureReason {
  value: number;
  labelAr: string;
  labelEn: string;
}

export interface DeliveryOption {
  value: number;
  labelAr: string;
  labelEn: string;
}

// Enums
export enum DeliveryFailureReason {
  CustomerNotAvailable = 0,
  WrongAddress = 1,
  CustomerRefused = 2,
  CustomerRequestedDelay = 3,
  PhoneNotAnswered = 4,
  AreaNotAccessible = 5,
  Other = 99
}

export enum DeliveryOptionEnum {
  HomeDelivery = 0,
  PickupFromCompany = 1
}