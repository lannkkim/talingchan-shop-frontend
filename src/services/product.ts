import axiosInstance from "@/lib/axios";
import { Product } from "@/types/product";

export interface CreateProductInput {
  name: string;
  detail?: string;
  product_type_id?: number;
  user_id?: number;
  started_at?: string;
  ended_at?: string;
  cards: {
    card_id: number;
    quantity: number;
  }[];
  price?: {
    price: number;
    price_period_ended?: string;
  };
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get<Product[]>("/api/v1/product-lists/");
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await axiosInstance.get<Product>(
    `/api/v1/product-lists/${id}`
  );
  return response.data;
};

export const createProduct = async (
  data: CreateProductInput
): Promise<Product> => {
  const response = await axiosInstance.post<Product>(
    "/api/v1/product-lists/",
    data
  );
  return response.data;
};
