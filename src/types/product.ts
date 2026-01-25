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

export interface Product {
  product_id: string;
  product_code?: string; // Added code
  name: string;
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
  // Relationships
  product_stock_card?: ProductStockCard[];
  price_period?: PricePeriod[];
  users?: User & { shop?: Shop };
  market_min_price?: number;
  total_quantity?: number;
  quantity?: number;
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

export interface PricePeriod {
  price_period_id: string;
  product_id: string;
  price: string;
  status: string;
  price_period_started: string;
  price_period_ended?: string;
  created_at?: string;
}
