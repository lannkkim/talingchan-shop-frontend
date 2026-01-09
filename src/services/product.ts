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
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get<Product[]>("/api/v1/products/");
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await axiosInstance.get<Product>(`/api/v1/products/${id}`);
  return response.data;
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
