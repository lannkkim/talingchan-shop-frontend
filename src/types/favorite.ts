import type { Product } from "./product";

export interface Favorite {
  favorite_id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}
