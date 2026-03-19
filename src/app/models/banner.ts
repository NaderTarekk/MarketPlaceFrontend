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
  displayOrder?: number;
  isActive?: boolean;
}