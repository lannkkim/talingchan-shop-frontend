import { Card } from "./card";

export interface StockCard {
  stock_card_id: number;
  stock_id?: number;
  card_id: number;
  quantity: number;
  unit_use?: number;
  status: string;
  cards?: Card;
}
