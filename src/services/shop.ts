import axios from "@/lib/axios";
import { ShopProfile, UpdateShopProfileInput } from "@/types/shop";

export const getMyShop = async (): Promise<ShopProfile> => {
  const response = await axios.get("/api/v1/shop/me");
  return response.data;
};

export const updateMyShopProfile = async (
  input: UpdateShopProfileInput,
): Promise<ShopProfile["shop_profile"]> => {
  const response = await axios.put("/api/v1/shop/me/profile", input);
  return response.data;
};

export const enableStockCheck = async (): Promise<ShopProfile> => {
  const response = await axios.post("/api/v1/shop/me/stock-check");
  return response.data;
};

export const registerShop = async (data: FormData): Promise<any> => {
  const response = await axios.post("/api/v1/shop/register", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
export interface Bank {
  bank_id: string;
  bank_name: string;
  bank_code: string;
  bank_shortname: string;
  image?: string;
}

export const getBanks = async (): Promise<Bank[]> => {
  const response = await axios.get("/api/v1/banks");
  return response.data;
};

export interface AdminShopListResponse {
  shop_id: string;
  shop_code: string;
  shop_name: string;
  owner_name: string;
  status: string;
  requested_date: string;
  is_verified: boolean;
  shop_profile?: ShopProfile["shop_profile"];
  shop_bank?: {
    bank_name: string;
    bank_shortname: string;
    account_name: string;
    account_number: string;
    branch: string;
    book_image: string;
  };
}

export const getAdminShops = async (): Promise<AdminShopListResponse[]> => {
  const response = await axios.get("/api/v1/shop/admin/list");
  return response.data;
};

export const approveShop = async (shopID: string): Promise<any> => {
  const response = await axios.put(`/api/v1/shop/${shopID}/approve`);
  return response.data;
};

export const getShopRevenueDashboard = async (): Promise<any> => {
  const response = await axios.get("/api/v1/shop/revenue");
  return response.data;
};

export interface ShopAnalytics {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  avg_rating: number;
  total_reviews: number;
}

export const getShopAnalytics = async (): Promise<ShopAnalytics> => {
  const response = await axios.get("/api/v1/shop/me/analytics");
  return response.data;
};

export const getProductsByShop = async (shopId: string): Promise<any[]> => {
  const response = await axios.get(`/api/v1/products?shop_id=${shopId}`);
  return response.data;
};

export interface PublicShopResponse {
  shop_id: string;
  is_stock_check_enabled: boolean;
  level: string;
  status: string;
  is_verified: boolean;
  shop_profile?: {
    shop_name: string;
    shop_display?: string;
    shop_email?: string;
    shop_phone?: string;
  };
}

export const getShopById = async (shopId: string): Promise<PublicShopResponse> => {
  const response = await axios.get(`/api/v1/shops/${shopId}`);
  return response.data;
};
