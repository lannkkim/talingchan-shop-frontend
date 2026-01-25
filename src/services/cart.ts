import axios from "@/lib/axios";
import { Product } from "@/types/product";

export interface CartItem {
  cart_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export interface AddToCartInput {
  product_id: string;
  quantity: number;
}

export const getCart = async (): Promise<CartItem[]> => {
  const response = await axios.get("/api/v1/cart");
  return response.data;
};

export const addToCart = async (input: AddToCartInput): Promise<CartItem> => {
  const response = await axios.post("/api/v1/cart", input);
  return response.data;
};

export const updateCartQuantity = async (
  id: string,
  quantity: number,
): Promise<CartItem> => {
  const response = await axios.put(`/api/v1/cart/${id}`, { quantity });
  return response.data;
};

export const removeFromCart = async (id: string): Promise<void> => {
  await axios.delete(`/api/v1/cart/${id}`);
};

export interface CheckoutInput {
  shipping_address_id: string;
  payment_type_id: string;
  cart_item_ids?: string[];
}

export interface CheckoutResponse {
  order_ids: string[];
}

export const checkout = async (
  input: CheckoutInput,
): Promise<CheckoutResponse> => {
  const response = await axios.post("/api/v1/checkout", input);
  return response.data;
};
