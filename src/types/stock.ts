import { Card } from "./card";

export interface StockCard {
  stock_card_id: string;
  stock_id: string;
  card_id: string;
  quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
  card?: Card;
  unit_use: number;
}
