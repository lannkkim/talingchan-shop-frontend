import { Card } from "./card";
import { Type } from "./type";
import { User } from "./auth";

export interface ShopProfile {
  shop_profile_id: string;
  shop_id: string;
  user_profile_id: string;
  shop_name: string;
  shop_display?: string;
  owner_name?: string;
  shop_email?: string;
  shop_phone?: string;
}

export interface Shop {
  shop_id: string;
  user_id: string;
  level?: string;
  is_stock_check_enabled?: boolean;
  shop_code?: string; // Added code
  shop_profile?: ShopProfile;
}

// Add missing type definition
export interface ProductStockMerch {
  is_auto_extend?: boolean;
  auto_extend_trigger_min?: number;
  auto_extend_duration_min?: number;
  auto_extend_max_count?: number;
  bid_increment?: number;
  product_stock_merch_id: string;
  product_id: string;
  stock_merch_id: string;
  stock_merch?: {
    merch?: {
      image_name?: string;
    };
  };
}

export interface Product {
  product_id: string;
  product_code?: string; // Added code
  name: string;
  image_name?: string; // Snapshot for orders
  description?: string;
  status: string;
  title?: string;
  product_type_id?: string;
  user_id?: string;
  is_admin_shop?: boolean;
  started_at?: string;
  ended_at?: string;
  created_at?: string;
  product_type?: Type;
  transaction_type?: TransactionType;
  sell_type?: string;
  sell_type_code?: string;
  buy_now_price?: number | string;
  // Relationships
  product_stock_card?: ProductStockCard[];
  product_stock_merch?: ProductStockMerch[];
  price: number;
  price_period?: Array<{
    price: number;
    status: string;
  }>;
  shipping_fee?: number;
  users?: User & { shop?: Shop };
  market_min_price?: number;
  total_quantity?: number;
  quantity?: number;
  trade_wants?: Package[];
}

export interface Package {
  package_id: string;
  name: string;
  products?: Product[];
}

export interface TransactionType {
  transaction_type_id: string;
  transaction_type_code?: string; // Added code
  code: string;
  name: string;
  status: string;
}

export interface ProductStockCard {
  product_stock_card_id: string;
  product_id: string;
  stock_card_id: string;
  card_id?: string;
  quantity: number;
  status: string;
  market_price?: number;
  stock_card?: StockCard;
  card?: Card;
}

export interface StockCard {
  stock_card_id: string;
  card_id?: string;
  card?: Card;
}
