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
  vendorIsVerified: boolean;
  status: number;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  salesCount: number;
  rating: number;
  reviewCount: number;
  slug: string | null;
  createdAt: string;
    hasVariants: boolean;   
  sizes?: string;              
  colors?: string;             
  variants?: ProductVariant[]; 
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
  brandId: number | null;
  brandNameAr: string | null;
  brandNameEn: string | null;
   hasVariants: boolean;
  sizes?: string;
  colors?: string;
}

export interface ProductFilter {
  search?: string;
  categoryId?: number;
  brandId?: number;
  vendorId?: string;
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

export interface Store {
  vendorId: string;
  vendorName: string;
  vendorAddress: string | null;
  phoneNumber: string | null;
  productCount: number;
  totalOrders: number;
  averageRating: number;
  isVerified: boolean;
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

export interface ProductVariant {
  id?: number;
  size?: string;
  color?: string;
  stock: number;
  priceAdjustment?: number;
  image?: string;
}