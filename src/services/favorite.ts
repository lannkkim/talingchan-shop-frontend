import axiosInstance from "@/lib/axios";
import type { Favorite } from "@/types/favorite";

export const getMyFavorites = async (): Promise<Favorite[]> => {
  const res = await axiosInstance.get<Favorite[]>("/api/v1/favorites/me");
  return res.data;
};

export const addFavorite = async (productId: string): Promise<Favorite> => {
  const res = await axiosInstance.post<Favorite>("/api/v1/favorites", { product_id: productId });
  return res.data;
};

export const removeFavorite = async (productId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/favorites/${productId}`);
};

export const checkFavorite = async (productId: string): Promise<boolean> => {
  const res = await axiosInstance.get<{ is_favorite: boolean }>(
    `/api/v1/favorites/check/${productId}`
  );
  return res.data.is_favorite;
};
