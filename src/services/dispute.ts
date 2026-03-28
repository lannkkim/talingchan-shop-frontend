import axiosInstance from "@/lib/axios";
import type { Dispute, CreateDisputeInput, ResolveDisputeInput } from "@/types/dispute";

export const getMyDisputes = async (): Promise<Dispute[]> => {
  const res = await axiosInstance.get<Dispute[]>("/api/v1/disputes/me");
  return res.data;
};

export const getAdminDisputes = async (): Promise<Dispute[]> => {
  const res = await axiosInstance.get<Dispute[]>("/api/v1/disputes/admin");
  return res.data;
};

export const getDispute = async (disputeId: string): Promise<Dispute> => {
  const res = await axiosInstance.get<Dispute>(`/api/v1/disputes/${disputeId}`);
  return res.data;
};

export const createDispute = async (
  orderId: string,
  input: CreateDisputeInput
): Promise<Dispute> => {
  const res = await axiosInstance.post<Dispute>(`/api/v1/disputes/order/${orderId}`, input);
  return res.data;
};

export const resolveDispute = async (
  disputeId: string,
  input: ResolveDisputeInput
): Promise<Dispute> => {
  const res = await axiosInstance.post<Dispute>(
    `/api/v1/disputes/${disputeId}/resolve`,
    input
  );
  return res.data;
};
