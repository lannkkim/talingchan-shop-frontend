import axiosInstance from "@/lib/axios";
import { Order, Transportation } from "@/types/order";

export const getShopOrders = async (): Promise<Order[]> => {
  const response = await axiosInstance.get<Order[]>("/api/v1/orders/shop");
  return response.data;
};

export const updateTrackingNo = async (
  orderId: string,
  trackingNo: string,
  transportationId?: string,
): Promise<void> => {
  await axiosInstance.put(`/api/v1/orders/${orderId}/tracking`, {
    tracking_no: trackingNo,
    transportation_id: transportationId,
  });
};

export const shipOrder = async (
  orderId: string,
  trackingNo: string,
  transportationId: string,
): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/shop/${orderId}/ship`, {
    tracking_no: trackingNo,
    transportation_id: transportationId,
  });
};

export const getTransportations = async (): Promise<Transportation[]> => {
  const response = await axiosInstance.get<Transportation[]>(
    "/api/v1/transportations",
  );
  return response.data;
};
export const getUserOrders = async (): Promise<Order[]> => {
  const response = await axiosInstance.get<Order[]>("/api/v1/orders/me");
  return response.data;
};

export const getAdminOrders = async (): Promise<Order[]> => {
  const response = await axiosInstance.get<Order[]>("/api/v1/orders/admin");
  return response.data;
};

export const updateAdminOrderStatus = async (
  orderId: string,
  status: string,
): Promise<void> => {
  await axiosInstance.put(`/api/v1/orders/admin/${orderId}/status`, { status });
};

export const confirmPayment = async (orderId: string): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/admin/${orderId}/confirm-payment`);
};

export const rejectPayment = async (orderId: string): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/admin/${orderId}/reject-payment`);
};

export const receiveOrder = async (orderId: string): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/${orderId}/receive`);
};
