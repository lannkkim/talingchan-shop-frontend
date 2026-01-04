import { Card } from "./card";
import { Type } from "./type";

export interface ProductList {
  product_list_id: number;
  name: string;
  detail?: string;
  status: string;
  type_id?: number;
  user_id?: number;
  started_at?: string;
  ended_at?: string;
  created_at?: string;
  type?: Type;
  // Relationships
  product_card?: ProductCard[];
  price_period?: PricePeriod[];
}

export interface ProductCard {
  product_card_id: number;
  product_list_id: number;
  card_id: number;
  quantity: number;
  status: string;
  cards?: Card;
}

export interface PricePeriod {
  price_period_id: number;
  product_list_id: number;
  price: string; // Decimal is returned as string in JS
  status: string;
  price_period_started: string;
  price_period_ended?: string;
  created_at?: string;
}
