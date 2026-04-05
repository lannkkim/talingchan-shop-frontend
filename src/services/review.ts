import axiosInstance from "@/lib/axios";
import type { Review, CreateReviewInput } from "@/types/review";

// Backend only has: POST /orders/:id/review and GET /shops/:id/reviews
// There is no product-level review endpoint, my-reviews endpoint, or delete endpoint

export const getShopReviews = async (shopId: string): Promise<Review[]> => {
  const res = await axiosInstance.get<Review[]>(`/api/v1/shops/${shopId}/reviews`);
  return res.data;
};

// Stub — backend has no /reviews/me endpoint yet
export const getMyReviews = async (): Promise<Review[]> => {
  return [];
};

export const createReview = async (
  orderId: string,
  input: CreateReviewInput
): Promise<Review> => {
  const res = await axiosInstance.post<Review>(`/api/v1/orders/${orderId}/review`, input);
  return res.data;
};
