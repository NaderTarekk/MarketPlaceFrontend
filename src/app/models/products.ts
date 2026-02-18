export interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  sku: string;
  costPrice: number;
  price: number;
  originalPrice: number | null;
  discountPercentage: number | null;
  stock: number;
  mainImage: string;
  images: string[];
  categoryId: number;
  categoryNameAr: string | null;
  categoryNameEn: string | null;
  brandId: number | null;
  brandNameAr: string | null;
  brandNameEn: string | null;
  vendorId: string;
  vendorName: string | null;
  status: number;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  salesCount: number;
  rating: number;
  reviewCount: number;
  slug: string | null;
  createdAt: string;
}

export interface ProductList {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number;
  originalPrice: number | null;
  discountPercentage: number | null;
  mainImage: string;
  stock: number;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  status: number;
  categoryNameAr: string | null;
  categoryNameEn: string | null;
  isFeatured: boolean;
}

export interface ProductFilter {
  search?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
  status?: number;
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
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}