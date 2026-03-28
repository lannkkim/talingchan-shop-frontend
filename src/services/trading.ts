import axiosInstance from "@/lib/axios";
import type {
  TradingOffer,
  CreateTradingOfferInput,
  RespondOfferInput,
} from "@/types/trading";

export const getMyOffers = async (): Promise<TradingOffer[]> => {
  const res = await axiosInstance.get<TradingOffer[]>("/api/v1/trading/offers/me");
  return res.data;
};

export const getOffersForProduct = async (productId: string): Promise<TradingOffer[]> => {
  const res = await axiosInstance.get<TradingOffer[]>(`/api/v1/trading/offers/product/${productId}`);
  return res.data;
};

export const createOffer = async (input: CreateTradingOfferInput): Promise<TradingOffer> => {
  const res = await axiosInstance.post<TradingOffer>("/api/v1/trading/offers", input);
  return res.data;
};

export const respondOffer = async (
  offerId: string,
  input: RespondOfferInput
): Promise<TradingOffer> => {
  const res = await axiosInstance.put<TradingOffer>(
    `/api/v1/trading/offers/${offerId}/respond`,
    input
  );
  return res.data;
};

export const cancelOffer = async (offerId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/trading/offers/${offerId}`);
};
