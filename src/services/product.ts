import axiosInstance from "@/lib/axios";
import { Product } from "@/types/product";

export interface CreateProductInput {
  name: string;
  detail?: string;
  type_id?: number;
  user_id?: number;
  transaction_type_id?: number;
  sell_type_id?: number;
  buy_type_id?: number;
  started_at?: string;
  ended_at?: string;
  cards: {
    stock_card_id: number;
    quantity: number;
  }[];
  price?: {
    price: number;
    price_period_ended?: string;
  };
  quantity?: number;
}

export interface ProductFilter {
  status?: string;
  is_admin_shop?: boolean;
  exclude_ended?: boolean;
  include_shop?: boolean;
  product_type_code?: string;
  limit?: number;
  user_id?: number;
  card_id?: number;
}

export const getProducts = async (
  filter?: ProductFilter
): Promise<Product[]> => {
  const { data } = await axiosInstance.get("/api/v1/products/", {
    params: filter,
  });
  return data;
};

export const getMyProducts = async (
  filter?: ProductFilter
): Promise<Product[]> => {
  const { data } = await axiosInstance.get("/api/v1/products/me", {
    params: filter,
  });
  return data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await axiosInstance.get<Product>(`/api/v1/products/${id}`);
  return response.data;
};

export const updateProduct = async (
  id: number,
  data: Partial<Product>
): Promise<Product> => {
  const { data: responseData } = await axiosInstance.put(
    `/api/v1/products/${id}`,
    data
  );
  return responseData;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/products/${id}`);
};

export const createProduct = async (
  data: CreateProductInput
): Promise<Product> => {
  const response = await axiosInstance.post<Product>("/api/v1/products/", data);
  return response.data;
};

export const checkStock = async (
  cards: { stock_card_id: number; quantity: number }[]
): Promise<void> => {
  await axiosInstance.post("/api/v1/products/check-stock", { cards });
};
