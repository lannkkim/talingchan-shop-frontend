import axiosInstance from "@/lib/axios";

export interface TradeListInput {
  trade_id?: number;
  wish_id?: number;
  cash?: number;
  wish_list: string;
  trade_flag: string;
  wish_flag: string;
}

export interface ProductSummary {
  product_id: number;
  name: string;
  description?: string;
}

export interface TradeList {
  transaction_id: number;
  trade_id?: number;
  wish_id?: number;
  cash: number;
  trade_product?: ProductSummary;
  wish_product?: ProductSummary;
  created_at?: string;
  updated_at?: string;
}

export interface GetTradeListsParams {
  trade_id?: number;
  wish_id?: number;
  user_id?: number;
  limit?: number;
}

export const createTradeList = async (data: TradeListInput): Promise<TradeList> => {
  const response = await axiosInstance.post("/api/v1/trade-list", data);
  return response.data;
};

export const getTradeLists = async (params?: GetTradeListsParams): Promise<TradeList[]> => {
  const response = await axiosInstance.get("/api/v1/trade-list", { params });
  return response.data;
};

export const getTradeListById = async (id: number): Promise<TradeList> => {
  const response = await axiosInstance.get(`/api/v1/trade-list/${id}`);
  return response.data;
};

export const updateTradeList = async (id: number, data: TradeListInput): Promise<TradeList> => {
  const response = await axiosInstance.put(`/api/v1/trade-list/${id}`, data);
  return response.data;
};

export const deleteTradeList = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/trade-list/${id}`);
};
