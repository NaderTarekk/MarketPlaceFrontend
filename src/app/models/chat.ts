export interface ChatMessage {
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  sentAt: Date;
}

// src/app/models/chat.ts
export interface ChatSession {
  id: string;
  customerId?: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  type?: number; // 0 = Bot, 1 = Human
  status: string; // ✅ Changed from union type to string
  createdAt: Date | string;
  closedAt?: Date | string;
  unreadCount?: number;
  messages?: any[];
}