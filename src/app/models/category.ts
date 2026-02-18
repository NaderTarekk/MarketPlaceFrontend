// models/category.ts

export interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  productCount: number;
  image?: string;
  createdAt?: string;
  
  // 🆕 Hierarchy Fields
  parentId?: number | null;
  parentNameAr?: string;
  parentNameEn?: string;
  children?: Category[];
  
  // 🆕 Computed (from backend)
  isParent?: boolean;
  childrenCount?: number;
  hasChildren?: boolean;
}

export interface CategoryFilterParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  isActive?: boolean | null;
  
  // 🆕 Hierarchy Filters
  parentOnly?: boolean;      // Main categories only
  childrenOnly?: boolean;    // Subcategories only
  parentId?: number;         // Children of specific parent
  includeChildren?: boolean; // Include children in response
}

export interface CreateCategoryDto {
  nameAr: string;
  nameEn: string;
  image?: string | null;
  
  // 🆕 Parent ID (null = main category)
  parentId?: number | null;
}

export interface UpdateCategoryDto {
  nameAr?: string;
  nameEn?: string;
  isActive?: boolean;
  image?: string | null;
  
  // 🆕 Can change parent
  parentId?: number | null;
  removeParent?: boolean; // Flag to make it main category
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