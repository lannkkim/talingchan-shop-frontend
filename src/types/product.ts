import { Card } from "./card";
import { Type } from "./type";

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  status: string;
  title?: string; // Optional alias if needed
  product_type_id?: number;
  user_id?: number;
  started_at?: string;
  ended_at?: string;
  created_at?: string;
  product_type?: Type;
  transaction_type?: TransactionType;
  // Relationships
  product_stock_card?: ProductStockCard[];
  price_period?: PricePeriod[];
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
  quantity: number;
  status: string;
  stock_card?: StockCard;
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
