export enum OrderStatus {
  CREATED = "CREATED",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  INVENTORY_RESERVED = "INVENTORY_RESERVED",
  COMPLETED = "COMPLETED"
}

export interface OrderEvent {
  orderId: string;
  userId: string;
  amount: number;
  status: OrderStatus;
  timestamp: number;
}