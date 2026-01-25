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
