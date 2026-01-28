import axiosInstance from "@/lib/axios";
import { Product } from "@/types/product";

export interface CreateProductInput {
  name: string;
  detail?: string;
  type_id?: string;
  user_id?: string;
  transaction_type_id?: string;
  sell_type_id?: string;
  buy_type_id?: string;
  started_at?: string;
  ended_at?: string;
  cards: {
    stock_card_id: string;
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
  user_id?: string;
  card_id?: string;
  sort_by?: string;
  sort_order?: string;
}

export const getProducts = async (
  filter?: ProductFilter,
): Promise<Product[]> => {
  const { data } = await axiosInstance.get("/api/v1/products", {
    params: filter,
  });
  return data;
};

export const getMyProducts = async (
  filter?: ProductFilter,
): Promise<Product[]> => {
  const { data } = await axiosInstance.get("/api/v1/products/my/all", {
    params: filter,
  });
  return data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await axiosInstance.get<Product>(`/api/v1/products/${id}`);
  return response.data;
};

export const updateProduct = async (
  id: string,
  data: Partial<Product>,
): Promise<Product> => {
  const { data: responseData } = await axiosInstance.put(
    `/api/v1/products/${id}`,
    data,
  );
  return responseData;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/products/${id}`);
};

export const createProduct = async (
  data: CreateProductInput,
): Promise<Product> => {
  const response = await axiosInstance.post<Product>("/api/v1/products", data);
  return response.data;
};

export const checkStock = async (
  cards: { stock_card_id: string; quantity: number }[],
): Promise<void> => {
  await axiosInstance.post("/api/v1/products/check-stock", { cards });
};
