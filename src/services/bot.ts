import axiosInstance from "@/lib/axios";
import type { BotCatalog, CreateBotInput } from "@/types/bot";

export const getBots = async (): Promise<BotCatalog[]> => {
  const res = await axiosInstance.get<BotCatalog[]>("/api/v1/bots");
  return res.data;
};

export const getBot = async (id: string): Promise<BotCatalog> => {
  const res = await axiosInstance.get<BotCatalog>(`/api/v1/bots/${id}`);
  return res.data;
};

export const getAdminBots = async (): Promise<BotCatalog[]> => {
  const res = await axiosInstance.get<BotCatalog[]>("/api/v1/admin/bots");
  return res.data;
};

export const createBot = async (input: CreateBotInput): Promise<BotCatalog> => {
  const res = await axiosInstance.post<BotCatalog>("/api/v1/admin/bots", input);
  return res.data;
};

export const updateBot = async (
  id: string,
  input: Partial<CreateBotInput>
): Promise<BotCatalog> => {
  const res = await axiosInstance.put<BotCatalog>(`/api/v1/admin/bots/${id}`, input);
  return res.data;
};

export const deleteBot = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/admin/bots/${id}`);
};

export interface BulkImportResult {
  imported: number;
  errors?: { row: number; message: string }[];
}

export const bulkImportBots = async (file: File): Promise<BulkImportResult> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post<BulkImportResult>("/api/v1/admin/bots/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
