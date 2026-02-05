export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: string; // "Customer" | "Vendor" | "DeliveryAgent"
  // Vendor specific fields
  businessName?: string;
  commercialRegistration?: string;
  taxNumber?: string;
  businessAddress?: string;
}

export interface GoogleLoginDto {
  token: string;
}

export interface CompleteGoogleProfileDto {
  email: string;
  googleToken: string;
  fullName: string;
  phoneNumber: string;
  age: number;
}

export interface AuthResponse {
  success: boolean;
  isNewUser?: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  role?: string;
  user?: any;
}