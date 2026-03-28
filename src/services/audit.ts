import axiosInstance from "@/lib/axios";
import type { AuditLog } from "@/types/audit";

export const getAuditLogs = async (params?: {
  admin_id?: string;
  action?: string;
  resource_type?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> => {
  const res = await axiosInstance.get<AuditLog[]>("/api/v1/admin/audit-logs", { params });
  return res.data;
};
