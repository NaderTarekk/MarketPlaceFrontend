export interface CartItem {
  id: number;
  productId: number;
  productNameAr: string;
  productNameEn: string;
  productImage: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  stock: number;
}

export interface CartResponse {
  items: CartItem[];
}