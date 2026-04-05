export interface TradingOffer {
  offer_id: string;
  product_id: string;
  product_name?: string;
  offerer_id: string;
  offerer_name?: string;
  offer_type: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "EXPIRED";
  additional_cash?: string;
  message?: string;
  items: TradingOfferItem[];
  order_id?: string;
  trade_execution_id?: string;
  created_at: string;
}

export interface TradeExecution {
  trade_execution_id: string;
  offer_id: string;
  party_a_user_id: string;
  party_a_username?: string;
  party_b_user_id: string;
  party_b_username?: string;
  status: "AGREED" | "SHIPPING" | "COMPLETED" | "CANCELLED";
  party_a_tracking?: string;
  party_a_shipped_at?: string;
  party_a_confirmed: boolean;
  party_b_tracking?: string;
  party_b_shipped_at?: string;
  party_b_confirmed: boolean;
  cancelled_by?: string;
  cancel_reason?: string;
  completed_at?: string;
  created_at: string;
}

export interface TradingOfferItem {
  offer_item_id: string;
  stock_card_id?: string;
  stock_merch_id?: string;
  quantity: number;
}

export interface CreateTradingOfferInput {
  target_product_id: string;
  items: { stock_card_id?: string; stock_merch_id?: string; quantity: number }[];
  additional_cash?: string;
  message?: string;
}
