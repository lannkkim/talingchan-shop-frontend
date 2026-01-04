import axiosInstance from "@/lib/axios";
import { ProductList } from "@/types/product";

export interface CreateProductInput {
  name: string;
  detail?: string;
  type_id?: number;
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

export const getProducts = async (): Promise<ProductList[]> => {
  const response = await axiosInstance.get<ProductList[]>(
    "/api/v1/product-lists/"
  );
  return response.data;
};

export const getProductById = async (id: number): Promise<ProductList> => {
  const response = await axiosInstance.get<ProductList>(
    `/api/v1/product-lists/${id}`
  );
  return response.data;
};

export const createProduct = async (
  data: CreateProductInput
): Promise<ProductList> => {
  const response = await axiosInstance.post<ProductList>(
    "/api/v1/product-lists/",
    data
  );
  return response.data;
};
