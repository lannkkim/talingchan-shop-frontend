import type { Product } from "./product";
import type { User } from "./auth";

export interface BidOrder {
  bid_order_id: string;
  product_id: string;
  product_name?: string;
  product_status?: string;
  user_id: string;
  bid_amount: string;
  is_winning: boolean;
  is_buy_now: boolean;
  created_at: string;
  user?: User;
  product?: Product;
}

export interface AuctionProduct extends Product {
  // Auction-specific fields (from ProductResponse — now returned as numbers)
  start_price?: number | string;
  min_bid_increment?: number | string;
  auction_start_at?: string;
  auction_end_at?: string;
  // is_auto_extend not stored in DB — check auto_extend_trigger_min != null instead
  auto_extend_trigger_min?: number;
  auto_extend_duration_min?: number;
  auto_extend_max_count?: number;
  auto_extend_current_count?: number;
  // Computed/aggregated
  highest_bid?: string;
  bidder_count?: number;
  bid_history?: BidOrder[];
}

export interface AuctionState {
  product_id: string;
  highest_bid?: string;
  bidder_count: number;
  time_remaining_seconds?: number;
  is_extended: boolean;
  buy_now_available: boolean;
  buy_now_price?: string;
  min_bid_increment?: string;
  auction_end_at?: string;
  auto_extend_trigger_min?: number;
  auto_extend_duration_min?: number;
  auto_extend_max_count?: number;
  auto_extend_current_count: number;
}

export interface PlaceBidInput {
  amount: string;
}
