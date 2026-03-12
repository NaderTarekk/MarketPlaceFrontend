// src/app/models/warehouse.ts

export interface Shelf {
  id: number;
  code: string;
  qrCode: string | null;
  description: string | null;
  isActive: boolean;
  ordersCount: number;
}

export interface CreateShelf {
  code: string;
  description?: string;
}

export enum WarehouseOrderStatus {
  Created = 0,
  OnTheWayToWarehouse = 1,
  InWarehouse = 2,
  ReadyForPickup = 3,
  PickedUp = 4
}

export interface WarehouseOrder {
 id: number;
  orderId: number;
  orderNumber: string;
  orderQRCode: string;
  vendorName: string;
  shelfId?: number;
  shelfCode?: string;
  status: WarehouseOrderStatus;
  createdAt: string;
  storedAt?: string;
  pickedAt?: string; // ✅ Add this
  storedById?: string;
  storedByName?: string;
  notes?: string;
  total: number;
}

export interface StoreOrderInShelf {
  orderQRCode: string;
  shelfQRCode: string;
  notes?: string;
}

export interface CustomerOrders {
  customerName: string;
  customerPhone: string;
  customerQRCode: string;
  orders: CustomerOrderItem[];
}

export interface CustomerOrderItem {
  orderId: number;
  orderNumber: string;
  orderQRCode: string;
  vendorName: string;
  shelfCode: string | null;
  status: WarehouseOrderStatus;
  total: number;
  createdAt: string;
}

export interface PickupOrder {
  orderQRCode: string;
}

export interface SearchWarehouse {
  orderNumber?: string;
  phoneNumber?: string;
  qrCode?: string;
}