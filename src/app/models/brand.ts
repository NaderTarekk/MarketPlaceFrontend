export interface Brand {
  id: number;
  nameAr: string;
  nameEn: string;
  logo: string | null;
  isActive: boolean;
  isFeatured: boolean;
  orderCount: number;
  productCount: number;
  complaintsCount: number;
  isBlocked: boolean;
  blockReason?: string;
  blockCount: number;
  blockHistory: BlockHistory[];
}

export interface BlockHistory {
  id: number;
  reason: string;
  createdAt: string;
  isActive: boolean;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}