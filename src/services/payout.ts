import axiosInstance from "@/lib/axios";
import type { Payout, RequestPayoutInput, AdminPayoutActionInput } from "@/types/payout";

export const getMyPayouts = async (): Promise<Payout[]> => {
  const res = await axiosInstance.get<Payout[]>("/api/v1/shop/payouts");
  return res.data;
};

export const requestPayout = async (input: RequestPayoutInput): Promise<Payout> => {
  const res = await axiosInstance.post<Payout>("/api/v1/shop/payouts/request", input);
  return res.data;
};

export const getAdminPayouts = async (status?: string): Promise<Payout[]> => {
  const res = await axiosInstance.get<Payout[]>("/api/v1/admin/payouts", {
    params: status ? { status } : undefined,
  });
  return res.data;
};

export const processAdminPayout = async (payoutId: string): Promise<Payout> => {
  const res = await axiosInstance.post<Payout>(`/api/v1/admin/payouts/${payoutId}/process`);
  return res.data;
};

export const completeAdminPayout = async (
  payoutId: string,
  input: AdminPayoutActionInput
): Promise<Payout> => {
  const res = await axiosInstance.post<Payout>(
    `/api/v1/admin/payouts/${payoutId}/complete`,
    input
  );
  return res.data;
};

export const failAdminPayout = async (
  payoutId: string,
  input: AdminPayoutActionInput
): Promise<Payout> => {
  const res = await axiosInstance.post<Payout>(
    `/api/v1/admin/payouts/${payoutId}/fail`,
    input
  );
  return res.data;
};
