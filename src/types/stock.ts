import { Card } from "./card";

export interface StockCard {
  stock_card_id: number;
  stock_id: number;
  card_id: number;
  quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
  cards?: Card; // Prisma returns 'cards' (lowercase) for the relation
}
