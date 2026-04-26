export interface Banner {
  id: number;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  imageUrl: string;
  buttonText: string;
  buttonTextAr: string;
  buttonLink: string;
  linkType: number; // 0=Custom, 1=Product, 2=Brand, 3=Category, 4=Promotion
  linkTargetId: number | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateBanner {
  title: string;
  titleAr: string;
  subtitle?: string;
  subtitleAr?: string;
  buttonText?: string;
  buttonTextAr?: string;
  buttonLink?: string;
  linkType?: number;
  linkTargetId?: number | null;
  displayOrder?: number;
  isActive?: boolean;
}