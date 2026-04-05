import axiosInstance from "@/lib/axios";
import type { Dispute, CreateDisputeInput, ResolveDisputeInput } from "@/types/dispute";

// GET /disputes — returns disputes for current user (or all if admin)
export const getMyDisputes = async (): Promise<Dispute[]> => {
  const res = await axiosInstance.get<Dispute[]>("/api/v1/disputes");
  return res.data ?? [];
};

export const getAdminDisputes = async (): Promise<Dispute[]> => {
  const res = await axiosInstance.get<Dispute[]>("/api/v1/disputes");
  return res.data ?? [];
};

export const getDispute = async (disputeId: string): Promise<Dispute> => {
  const res = await axiosInstance.get<Dispute>(`/api/v1/disputes/${disputeId}`);
  return res.data;
};

// POST /disputes — body contains order_id
export const createDispute = async (
  orderId: string,
  input: CreateDisputeInput
): Promise<Dispute> => {
  const res = await axiosInstance.post<Dispute>("/api/v1/disputes", {
    order_id: orderId,
    ...input,
  });
  return res.data;
};

// POST /disputes/:id/resolve (admin only)
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

// POST /disputes/:id/evidence
export const addEvidence = async (disputeId: string, evidence: FormData): Promise<void> => {
  await axiosInstance.post(`/api/v1/disputes/${disputeId}/evidence`, evidence, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
