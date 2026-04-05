import axiosInstance from "@/lib/axios";
import type { TradingOffer, TradeExecution, CreateTradingOfferInput } from "@/types/trading";

// GET /trading/:productId/offers — offers for a specific product
export const getOffersForProduct = async (productId: string): Promise<TradingOffer[]> => {
  const res = await axiosInstance.get<TradingOffer[]>(`/api/v1/trading/${productId}/offers`);
  return res.data ?? [];
};

// POST /trading/:productId/offer — submit a trade offer
export const createOffer = async (input: CreateTradingOfferInput): Promise<TradingOffer> => {
  const { target_product_id, ...body } = input;
  const res = await axiosInstance.post<TradingOffer>(
    `/api/v1/trading/${target_product_id}/offer`,
    body
  );
  return res.data;
};

// PUT /trading/offers/:id/accept
export const acceptOffer = async (offerId: string): Promise<TradingOffer> => {
  const res = await axiosInstance.put<TradingOffer>(`/api/v1/trading/offers/${offerId}/accept`);
  return res.data;
};

// PUT /trading/offers/:id/reject
export const rejectOffer = async (offerId: string): Promise<TradingOffer> => {
  const res = await axiosInstance.put<TradingOffer>(`/api/v1/trading/offers/${offerId}/reject`);
  return res.data;
};

// DELETE /trading/offers/:id
export const cancelOffer = async (offerId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/trading/offers/${offerId}`);
};

// GET /trading/my-offers — offers I've sent
export const getMyOffers = async (): Promise<TradingOffer[]> => {
  const res = await axiosInstance.get<TradingOffer[]>("/api/v1/trading/my-offers");
  return res.data ?? [];
};

// Buy-order offer routes
export const getBuyOrderOffers = async (productId: string): Promise<TradingOffer[]> => {
  const res = await axiosInstance.get<TradingOffer[]>(`/api/v1/buy-orders/${productId}/offers`);
  return res.data ?? [];
};

export const submitBuyOrderOffer = async (
  productId: string,
  input: Omit<CreateTradingOfferInput, "target_product_id">
): Promise<TradingOffer> => {
  const res = await axiosInstance.post<TradingOffer>(`/api/v1/buy-orders/${productId}/offer`, input);
  return res.data;
};

export const acceptBuyOrderOffer = async (offerId: string): Promise<TradingOffer> => {
  const res = await axiosInstance.put<TradingOffer>(`/api/v1/buy-orders/offers/${offerId}/accept`);
  return res.data;
};

// Trade execution endpoints
export const getMyTradeExecutions = async (): Promise<TradeExecution[]> => {
  const res = await axiosInstance.get<TradeExecution[]>("/api/v1/trading/executions");
  return res.data ?? [];
};

export const getTradeExecution = async (id: string): Promise<TradeExecution> => {
  const res = await axiosInstance.get<TradeExecution>(`/api/v1/trading/executions/${id}`);
  return res.data;
};

export const submitTrackingNumber = async (id: string, trackingNo: string): Promise<TradeExecution> => {
  const res = await axiosInstance.put<TradeExecution>(`/api/v1/trading/executions/${id}/tracking`, { tracking_no: trackingNo });
  return res.data;
};

export const confirmTradeReceipt = async (id: string): Promise<TradeExecution> => {
  const res = await axiosInstance.put<TradeExecution>(`/api/v1/trading/executions/${id}/confirm`);
  return res.data;
};

export const cancelTradeExecution = async (id: string, reason: string): Promise<TradeExecution> => {
  const res = await axiosInstance.put<TradeExecution>(`/api/v1/trading/executions/${id}/cancel`, { reason });
  return res.data;
};
