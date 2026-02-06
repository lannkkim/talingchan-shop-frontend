import axios from "@/lib/axios";
import { CardInput } from "./product"; // Reuse CardInput

export interface CreatePackageTradeInput {
  name: string;
  detail?: string;
  started_at?: string;
  ended_at?: string;
  cash_trade?: number;
  wishlist_trade?: string;
  have_cards: CardInput[];
  want_options: {
    cards: CardInput[];
    cash_wish?: number;
    wishlist_wish?: string;
  }[];
}

export const createTrade = async (data: CreatePackageTradeInput) => {
  const response = await axios.post("/api/v1/packages/trade", data);
  return response.data;
};
