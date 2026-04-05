import axiosInstance from "@/lib/axios";
import { Product } from "@/types/product";

export interface CardInput {
  stock_card_id: string;
  quantity: number;
}

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
  cards: CardInput[];
  merch?: {
    merch_id: string;
    quantity: number;
  }[];
  price?: {
    price: number;
  };
  shipping_fee?: number;
  quantity?: number;
  products?: {
    product_id: string;
    quantity: number;
  }[];
  trade_wants?: { stock_card_id: string; quantity: number }[][];
  // Auction-specific fields
  start_price?: number;
  buy_now_price?: number;
  min_bid_increment?: number;
  bid_increment?: number;
  auction_start_at?: string;
  auction_end_at?: string;
  is_auto_extend?: boolean;
  auto_extend_trigger_min?: number;
  auto_extend_duration_min?: number;
  auto_extend_max_count?: number;
}

export interface ProductFilter {
  status?: string;
  is_admin_shop?: boolean;
  exclude_ended?: boolean;
  include_shop?: boolean;
  product_type_code?: string;
  product_type_flag_code?: string;
  limit?: number;
  user_id?: string;
  card_id?: string;
  sort_by?: string;
  sort_order?: string;
  transaction_type_code?: string;
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

export const getProduct = getProductById;

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
  transactionType: "sell" | "buy" | "auction" = "sell",
): Promise<Product> => {
  const endpoint =
    transactionType === "buy"
      ? "/api/v1/products/buy"
      : transactionType === "auction"
      ? "/api/v1/products/auction"
      : "/api/v1/products/sell";
  const response = await axiosInstance.post<Product>(endpoint, data);
  return response.data;
};

export const checkStock = async (
  cards: { stock_card_id: string; quantity: number }[],
): Promise<void> => {
  await axiosInstance.post("/api/v1/products/check-stock", { cards });
};

export const activateProduct = async (id: string): Promise<Product> => {
  const res = await axiosInstance.post<Product>(`/api/v1/products/${id}/activate`);
  return res.data;
};

export const deactivateProduct = async (id: string): Promise<Product> => {
  const res = await axiosInstance.post<Product>(`/api/v1/products/${id}/deactivate`);
  return res.data;
};
