import axiosInstance from "@/lib/axios";
import type { DataExport, DeletionRequest } from "@/types/pdpa";

export const exportMyData = async (): Promise<DataExport> => {
  const res = await axiosInstance.get<DataExport>("/api/v1/pdpa/export");
  return res.data;
};

export const requestDeletion = async (): Promise<DeletionRequest> => {
  const res = await axiosInstance.post<DeletionRequest>("/api/v1/pdpa/deletion-request");
  return res.data;
};
