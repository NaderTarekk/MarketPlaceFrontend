export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  profileImage: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bio: string | null;
  createdAt: string;
  businessName: string | null;
  commercialRegistration: string | null;
  taxNumber: string | null;
  businessAddress: string | null;
  isApproved: boolean;
}

export interface ProfileStats {
  ordersCount: number;
  wishlistCount: number;
  reviewsCount: number;
}

export interface UpdateProfile {
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  businessName?: string;
  businessAddress?: string;
}