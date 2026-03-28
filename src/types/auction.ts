import type { Product } from "./product";
import type { User } from "./auth";

export interface BidOrder {
  bid_order_id: string;
  product_id: string;
  user_id: string;
  bid_amount: string;
  is_winning: boolean;
  is_buy_now: boolean;
  created_at: string;
  user?: User;
  product?: Product;
}

export interface AuctionProduct extends Product {
  highest_bid?: string;
  bidder_count?: number;
  bid_history?: BidOrder[];
}

export interface PlaceBidInput {
  amount: string;
}
