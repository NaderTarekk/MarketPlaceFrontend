export interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  productCount: number;
  hasChildren: boolean;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: CategoryDto[];
  pagination?: any;
}

export interface CategoryDto {
  id: number;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  createdAt: string;
  productCount: number;
}