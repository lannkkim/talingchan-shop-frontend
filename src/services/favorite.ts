import axiosInstance from "@/lib/axios";
import type { Favorite } from "@/types/favorite";

export const getMyFavorites = async (): Promise<Favorite[]> => {
  const res = await axiosInstance.get<Favorite[]>("/api/v1/users/me/favorites");
  return res.data ?? [];
};

export const addFavorite = async (productId: string): Promise<Favorite> => {
  const res = await axiosInstance.post<Favorite>(`/api/v1/users/me/favorites/${productId}`);
  return res.data;
};

export const removeFavorite = async (productId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/users/me/favorites/${productId}`);
};
