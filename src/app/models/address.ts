export interface UserAddress {
  id: number;
  label: string; // 'Home', 'Work', 'Other'
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressDto {
  label: string;
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export interface UpdateAddressDto {
  label?: string;
  fullName?: string;
  phoneNumber?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}