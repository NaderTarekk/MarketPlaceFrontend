export interface PromoCode {
  id: number;
  code: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: string;
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  maxUsageCount?: number;
  usedCount: number;
  maxUsagePerUser?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PromoCodeValidation {
  isValid: boolean;
  message?: string;
  discountAmount: number;
  discountType?: string;
  discountValue: number;
}

export interface CreatePromoCode {
  code: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: number;
  value: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  maxUsageCount?: number;
  maxUsagePerUser?: number;
  startDate?: string;
  endDate?: string;
}