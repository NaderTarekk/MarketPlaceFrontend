export interface PickupPoint {
  id: number;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  governorateId: number;
  governorateNameAr?: string;
  governorateNameEn?: string;
}

export interface CreatePickupPoint {
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  latitude: number;
  longitude: number;
  governorateId: number;
}

export interface UpdatePickupPoint {
  nameAr?: string;
  nameEn?: string;
  addressAr?: string;
  addressEn?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  governorateId?: number;
}
