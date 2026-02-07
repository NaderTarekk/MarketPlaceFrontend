export interface WishlistItem {
  id: number;
  productId: number;
  productNameAr: string;
  productNameEn: string;
  productImage: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  addedAt: string;
}