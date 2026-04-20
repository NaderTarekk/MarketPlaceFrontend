export interface Governorate {
  id: number;
  nameAr: string;
  nameEn: string;
  shippingCost: number;
  isFreeShipping: boolean;
  isActive: boolean;
  sortOrder: number;
  estimatedDeliveryDays: number;
}

export interface CreateGovernorate {
  nameAr: string;
  nameEn: string;
  shippingCost: number;
  isFreeShipping?: boolean;
  sortOrder?: number;
  estimatedDeliveryDays?: number;
}

export interface UpdateGovernorate {
  nameAr?: string;
  nameEn?: string;
  shippingCost?: number;
  isFreeShipping?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  estimatedDeliveryDays?: number;
}
