import axiosInstance from "@/lib/axios";
import { Type, SellType, BuyType } from "@/types/type";
import { TransactionType } from "@/types/product";

export const getTypes = async (): Promise<Type[]> => {
  const response = await axiosInstance.get<Type[]>("/api/v1/types/");
  return response.data;
};

export const getTransactionTypes = async (): Promise<TransactionType[]> => {
  const response = await axiosInstance.get<TransactionType[]>(
    "/api/v1/types/transaction"
  );
  return response.data;
};

export const getSellTypes = async (): Promise<SellType[]> => {
  const response = await axiosInstance.get<SellType[]>("/api/v1/types/sell");
  return response.data;
};

export const getBuyTypes = async (): Promise<BuyType[]> => {
  const response = await axiosInstance.get<BuyType[]>("/api/v1/types/buy");
  return response.data;
};
