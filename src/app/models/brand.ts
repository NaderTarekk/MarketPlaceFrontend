export interface Brand {
  id: number;
  nameAr: string;
  nameEn: string;
  logo: string | null;
  isActive: boolean;
  productCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}