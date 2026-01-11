import { Card } from "./card";
import { Type } from "./type";
import { User } from "./auth";

export interface ShopProfile {
  shop_profile_id: number;
  shop_id: number;
  user_profile_id: number;
  shop_name: string;
  shop_display?: string;
  owner_name?: string;
  shop_email?: string;
  shop_phone?: string;
}

export interface Shop {
  shop_id: number;
  user_id: number;
  level?: string;
  is_stock_check_enabled?: boolean;
  shop_profile?: ShopProfile;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  status: string;
  title?: string; // Optional alias if needed
  product_type_id?: number;
  user_id?: number;
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
}

export interface TransactionType {
  transaction_type_id: number;
  code: string;
  name: string;
  status: string;
}

export interface ProductStockCard {
  product_stock_card_id: number;
  product_id: number;
  stock_card_id: number;
  card_id?: number;
  quantity: number;
  status: string;
  market_price?: number;
  stock_card?: StockCard;
  card?: Card;
}

export interface StockCard {
  stock_card_id: number;
  card_id?: number;
  cards?: Card;
}

export interface PricePeriod {
  price_period_id: number;
  product_id: number;
  price: string;
  status: string;
  price_period_started: string;
  price_period_ended?: string;
  created_at?: string;
}
