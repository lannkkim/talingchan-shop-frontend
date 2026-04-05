import axiosInstance from "@/lib/axios";

export interface Merch {
  merch_id: string;
  name: string;
  image_name?: string;
}

export interface MerchFilter {
  search?: string;
  page?: number;
  limit?: number;
}

export const getMerch = async (filter?: MerchFilter): Promise<Merch[]> => {
  const { data } = await axiosInstance.get("/api/v1/merch", {
    params: filter,
  });
  return data;
};

export interface BulkImportResult {
  imported: number;
  errors?: { row: number; message: string }[];
}

export const bulkImportMerch = async (file: File): Promise<BulkImportResult> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post<BulkImportResult>("/api/v1/admin/merch/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
