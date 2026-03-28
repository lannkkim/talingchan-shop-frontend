import type { Product } from "./product";
import type { User } from "./auth";

export interface TradingOffer {
  trading_offer_id: string;
  offerer_id: string;
  target_product_id: string;
  offered_items: OfferedItem[];
  cash_top_up?: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COUNTERED";
  counter_offer?: string;
  created_at: string;
  updated_at: string;
  offerer?: User;
  target_product?: Product;
}

export interface OfferedItem {
  product_id?: string;
  package_id?: string;
  description?: string;
}

export interface CreateTradingOfferInput {
  target_product_id: string;
  offered_items: OfferedItem[];
  cash_top_up?: string;
  message?: string;
}

export interface RespondOfferInput {
  action: "ACCEPT" | "REJECT" | "COUNTER";
  counter_offer?: string;
}
