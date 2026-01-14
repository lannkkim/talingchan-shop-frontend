import axios from "@/lib/axios";

export interface CartItem {
  cart_id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product: any; // You might want to type this properly later
}

export interface AddToCartInput {
  product_id: number;
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
  id: number,
  quantity: number
): Promise<CartItem> => {
  const response = await axios.put(`/api/v1/cart/${id}`, { quantity });
  return response.data;
};

export const removeFromCart = async (id: number): Promise<void> => {
  await axios.delete(`/api/v1/cart/${id}`);
};
