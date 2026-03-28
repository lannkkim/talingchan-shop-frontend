import axiosInstance from "@/lib/axios";
import type { FeeRule, CreateFeeRuleInput } from "@/types/fee";

export const getFeeRules = async (): Promise<FeeRule[]> => {
  const res = await axiosInstance.get<FeeRule[]>("/api/v1/admin/fee-rules");
  return res.data;
};

export const createFeeRule = async (input: CreateFeeRuleInput): Promise<FeeRule> => {
  const res = await axiosInstance.post<FeeRule>("/api/v1/admin/fee-rules", input);
  return res.data;
};

export const updateFeeRule = async (
  id: string,
  input: Partial<CreateFeeRuleInput>
): Promise<FeeRule> => {
  const res = await axiosInstance.put<FeeRule>(`/api/v1/admin/fee-rules/${id}`, input);
  return res.data;
};

export const deleteFeeRule = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/admin/fee-rules/${id}`);
};
