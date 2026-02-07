export interface ReviewResponse {
  id: number;
  productId: number;
  productNameAr?: string;
  productNameEn?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CreateReviewDto {
  productId: number;
  rating: number;
  comment: string;
}

export interface ReviewFilter {
  productId?: number;
  isApproved?: boolean;
  rating?: number;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}