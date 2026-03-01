export interface Governorate {
  id: number;
  nameAr: string;
  nameEn: string;
  shippingCost: number;
  isFreeShipping: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateGovernorate {
  nameAr: string;
  nameEn: string;
  shippingCost: number;
  isFreeShipping?: boolean;
  sortOrder?: number;
}

export interface UpdateGovernorate {
  nameAr?: string;
  nameEn?: string;
  shippingCost?: number;
  isFreeShipping?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}
