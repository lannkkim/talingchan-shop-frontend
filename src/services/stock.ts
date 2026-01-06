import axiosInstance from "@/lib/axios";
import { StockCard } from "@/types/stock";

export const getMyStockCards = async (): Promise<StockCard[]> => {
  const response = await axiosInstance.get<StockCard[]>("/api/v1/stock-cards");
  return response.data;
};

export const createStockCard = async (
  cardId: number,
  quantity: number
): Promise<StockCard> => {
  const response = await axiosInstance.post<StockCard>("/api/v1/stock-cards", {
    card_id: cardId,
    quantity,
  });
  return response.data;
};
