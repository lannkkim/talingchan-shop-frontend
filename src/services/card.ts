import axiosInstance from "@/lib/axios";
import { Card } from "@/types/card";

export const getCards = async (
  page: number = 1,
  limit: number = 20
): Promise<Card[]> => {
  const response = await axiosInstance.get<Card[]>(
    `/api/v1/cards/?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getCardById = async (id: number): Promise<Card> => {
  const response = await axiosInstance.get<Card>(`/api/v1/cards/${id}`);
  return response.data;
};
