import axiosInstance from "@/lib/axios";
import { Card } from "@/types/card";

export interface CardFilters {
  search?: string;
  colors?: string[];
  types?: string[];
  rarities?: string[];
  subtypes?: string[];
  symbols?: string[];
  prints?: string[];
  gems?: number[];
  powers?: number[];
}

export const getCards = async (
  page: number = 1,
  limit: number = 20,
  filters?: CardFilters,
): Promise<Card[]> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (filters) {
    if (filters.search) params.append("search", filters.search);
    filters.colors?.forEach((c) => params.append("colors", c));
    filters.types?.forEach((t) => params.append("types", t));
    filters.rarities?.forEach((r) => params.append("rarities", r));
    filters.subtypes?.forEach((s) => params.append("subtypes", s));
    filters.symbols?.forEach((s) => params.append("symbols", s));
    filters.prints?.forEach((p) => params.append("prints", p));
    filters.gems?.forEach((g) => params.append("gems", g.toString()));
    filters.powers?.forEach((p) => params.append("powers", p.toString()));
  }

  const response = await axiosInstance.get<Card[]>(
    `/api/v1/cards/?${params.toString()}`,
  );
  return response.data;
};

export const getCardById = async (id: string): Promise<Card> => {
  // Updated
  const response = await axiosInstance.get<Card>(`/api/v1/cards/${id}`);
  return response.data;
};

export interface CardAnalytics {
  card_id: string;
  active_listings: number;
  min_price: number;
  max_price: number;
  avg_price: number;
}

export const getCardAnalytics = async (id: string): Promise<CardAnalytics> => {
  const response = await axiosInstance.get<CardAnalytics>(`/api/v1/cards/${id}/analytics`);
  return response.data;
};

export interface PriceHistoryPoint {
  date: string;
  price: number;
  product_name: string;
  product_type: string;
  status: string;
}

export const getCardPriceHistory = async (id: string, limit = 50): Promise<PriceHistoryPoint[]> => {
  const response = await axiosInstance.get<PriceHistoryPoint[]>(`/api/v1/cards/${id}/price-history?limit=${limit}`);
  return response.data ?? [];
};

export interface SalesHistoryPoint {
  date: string;
  price: number;
  quantity: number;
  product_name: string;
  order_status: string;
}

export const getCardSalesHistory = async (id: string, limit = 60): Promise<SalesHistoryPoint[]> => {
  const response = await axiosInstance.get<SalesHistoryPoint[]>(`/api/v1/cards/${id}/sales-history?limit=${limit}`);
  return response.data ?? [];
};

export interface BulkImportResult {
  imported: number;
  errors?: { row: number; message: string }[];
}

export const bulkImportCards = async (file: File): Promise<BulkImportResult> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post<BulkImportResult>("/api/v1/admin/cards/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
