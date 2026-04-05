import axiosInstance from "@/lib/axios";
import type { AuctionProduct, AuctionState, BidOrder, PlaceBidInput } from "@/types/auction";

export const getAuctionProducts = async (): Promise<AuctionProduct[]> => {
  const res = await axiosInstance.get<AuctionProduct[]>("/api/v1/products", {
    params: {
      transaction_type_code: "auction",
      status: "active",
      exclude_ended: true,
    },
  });
  return res.data;
};

export const getAuctionProduct = async (productId: string): Promise<AuctionProduct> => {
  const res = await axiosInstance.get<AuctionProduct>(`/api/v1/products/${productId}`);
  return res.data;
};

export const getAuctionState = async (productId: string): Promise<AuctionState> => {
  const res = await axiosInstance.get<AuctionState>(`/api/v1/auctions/${productId}/state`);
  return res.data;
};

export const getBidHistory = async (productId: string): Promise<BidOrder[]> => {
  const res = await axiosInstance.get<BidOrder[]>(`/api/v1/auctions/${productId}/bids`);
  return res.data;
};

export const placeBid = async (productId: string, input: PlaceBidInput): Promise<BidOrder> => {
  const res = await axiosInstance.post<BidOrder>(`/api/v1/auctions/${productId}/bid`, input);
  return res.data;
};

export const buyNow = async (productId: string): Promise<BidOrder> => {
  const res = await axiosInstance.post<BidOrder>(`/api/v1/auctions/${productId}/buy-now`);
  return res.data;
};

export const getMyBids = async (): Promise<BidOrder[]> => {
  const res = await axiosInstance.get<BidOrder[]>("/api/v1/auctions/me/bids");
  return res.data;
};
