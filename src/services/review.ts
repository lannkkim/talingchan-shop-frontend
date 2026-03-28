import axiosInstance from "@/lib/axios";
import type { Review, CreateReviewInput } from "@/types/review";

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const res = await axiosInstance.get<Review[]>(`/api/v1/reviews/product/${productId}`);
  return res.data;
};

export const getShopReviews = async (shopId: string): Promise<Review[]> => {
  const res = await axiosInstance.get<Review[]>(`/api/v1/reviews/shop/${shopId}`);
  return res.data;
};

export const getMyReviews = async (): Promise<Review[]> => {
  const res = await axiosInstance.get<Review[]>("/api/v1/reviews/me");
  return res.data;
};

export const createReview = async (
  orderId: string,
  input: CreateReviewInput
): Promise<Review> => {
  const res = await axiosInstance.post<Review>(`/api/v1/reviews/order/${orderId}`, input);
  return res.data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/reviews/${reviewId}`);
};
