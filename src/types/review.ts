import type { User } from "./auth";

export interface Review {
  review_id: string;
  order_id: string;
  reviewer_id: string;
  shop_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: User;
}

export interface CreateReviewInput {
  rating: number;
  comment?: string;
}
