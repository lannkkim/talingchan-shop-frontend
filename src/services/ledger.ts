import axiosInstance from "@/lib/axios";
import type { LedgerEntry, SellerBalance } from "@/types/ledger";

export const getSellerBalance = async (): Promise<SellerBalance> => {
  const res = await axiosInstance.get<SellerBalance>("/api/v1/ledger/balance");
  return res.data;
};

export const getAdminLedger = async (params?: {
  shop_id?: string;
  account_type?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<LedgerEntry[]> => {
  const res = await axiosInstance.get<LedgerEntry[]>("/api/v1/admin/ledger", { params });
  return res.data;
};
