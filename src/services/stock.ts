import axiosInstance from "@/lib/axios";
import { StockCard } from "@/types/stock";

export const getMyInventory = async (): Promise<StockCard[]> => {
  const response = await axiosInstance.get<StockCard[]>(
    "/api/v1/stock-cards/my-inventory",
  );
  return response.data;
};

export const createStockCard = async (
  cardId: string, // Updated
  quantity: number,
): Promise<StockCard> => {
  const response = await axiosInstance.post<StockCard>("/api/v1/stock-cards", {
    card_id: cardId,
    quantity: quantity,
  });
  return response.data;
};

export const getMyStockCards = async (): Promise<StockCard[]> => {
  const response = await axiosInstance.get<StockCard[]>("/api/v1/stock-cards");
  return response.data;
};
export const updateStock = async (
  stockCardId: string, // Updated
  data: { quantity?: number; status?: string },
): Promise<StockCard> => {
  const response = await axiosInstance.put<StockCard>(
    `/api/v1/stock-cards/${stockCardId}`,
    data,
  );
  return response.data;
};
