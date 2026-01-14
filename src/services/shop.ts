import axios from "@/lib/axios";
import { ShopProfile, UpdateShopProfileInput } from "@/types/shop";

export const getMyShop = async (): Promise<ShopProfile> => {
  const response = await axios.get("/api/v1/shop/me");
  return response.data;
};

export const updateMyShopProfile = async (
  input: UpdateShopProfileInput
): Promise<ShopProfile["shop_profile"]> => {
  const response = await axios.put("/api/v1/shop/me/profile", input);
  return response.data;
};

export const enableStockCheck = async (): Promise<ShopProfile> => {
  const response = await axios.post("/api/v1/shop/me/stock-check");
  return response.data;
};
