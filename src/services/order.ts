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

export const cancelRequest = async (
  orderId: string,
  reason: string,
): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/${orderId}/cancel-request`, {
    reason,
  });
};

export const cancelOrder = async (
  orderId: string,
  reason: string,
): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/shop/${orderId}/cancel`, { reason });
};

export const approveCancel = async (orderId: string): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/shop/${orderId}/cancel-approve`);
};

export const rejectCancel = async (
  orderId: string,
  trackingNo: string,
  transportationId?: string,
): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/shop/${orderId}/cancel-reject`, {
    tracking_no: trackingNo,
    transportation_id: transportationId,
  });
};

export const requestRefund = async (
  orderId: string,
  reason: string,
  images?: string[],
): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/${orderId}/refund-request`, {
    reason,
    images,
  });
};

export const reviewRefund = async (
  orderId: string,
  action: string,
  reason?: string,
): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/shop/${orderId}/refund-review`, {
    action,
    reason,
  });
};

export const updateReturnTracking = async (
  orderId: string,
  trackingNo: string,
): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/${orderId}/return-tracking`, {
    tracking_no: trackingNo,
  });
};

export const confirmReturn = async (orderId: string): Promise<void> => {
  await axiosInstance.post(`/api/v1/orders/shop/${orderId}/return-confirm`);
};

export const uploadPaymentSlip = async (
  orderId: string,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await axiosInstance.post(`/api/v1/orders/${orderId}/slip`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const resubmitPayment = async (
  orderId: string,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await axiosInstance.post(`/api/v1/orders/${orderId}/resubmit-payment`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadRefundImages = async (
  orderId: string,
  files: File[],
): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  const response = await axiosInstance.post<{ filenames: string[] }>(
    `/api/v1/orders/${orderId}/refund-images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.filenames;
};

export interface BulkShipResult {
  shipped: number;
  errors?: { order_id: string; message: string }[];
}

export const bulkShipOrders = async (file: File): Promise<BulkShipResult> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post<BulkShipResult>("/api/v1/orders/shop/ship-bulk", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

