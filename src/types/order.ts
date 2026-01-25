import { User } from "./auth";
import { Product } from "./product";

export interface OrderProduct {
  order_product_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string;
  product: Product;
}

export interface Transportation {
  transportation_id: string;
  name: string;
}

export interface Order {
  order_id: string;
  order_code?: string; // Added code
  buyer_id: string;
  seller_id: string;
  total_price: string;
  order_quantity: number;
  status: string;
  tracking_no?: string;
  status_tracking?: string;
  reciept_id?: string;
  created_at: string;
  updated_at: string;
  buyer: User & { user_profile?: Record<string, unknown> };
  order_product: OrderProduct[];
  payment_type?: {
    name: string;
  };
  transportation?: Transportation;
  address_user?: {
    name: string;
    phone: string;
    detail: string;
    sub_district: string;
    district: string;
    province: string;
    postal_code: string;
  };
}
