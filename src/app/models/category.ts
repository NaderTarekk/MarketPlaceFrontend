export interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
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


export interface CategoryFilterParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  isActive?: boolean | null;
}

export interface CreateCategoryDto {
  nameAr: string;
  nameEn: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  nameAr?: string;
  nameEn?: string;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}