import axiosInstance from "@/lib/axios";
import { Order, Transportation } from "@/types/order";

export const getShopOrders = async (): Promise<Order[]> => {
  const response = await axiosInstance.get<Order[]>("/api/v1/orders/shop");
  return response.data;
};

export const updateTrackingNo = async (
  orderId: number,
  trackingNo: string,
  transportationId?: number
): Promise<void> => {
  await axiosInstance.put(`/api/v1/orders/${orderId}/tracking`, {
    tracking_no: trackingNo,
    transportation_id: transportationId,
  });
};

export const getTransportations = async (): Promise<Transportation[]> => {
  const response = await axiosInstance.get<Transportation[]>(
    "/api/v1/transportations"
  );
  return response.data;
};
