import axiosInstance from "@/lib/axios";
import type { MysteryBox, MysteryBoxPurchase, PurchaseMysteryBoxInput } from "@/types/mystery-box";

export const getMysteryBoxes = async (): Promise<MysteryBox[]> => {
  const res = await axiosInstance.get<MysteryBox[]>("/api/v1/mystery-boxes");
  return res.data;
};

export const getMysteryBox = async (id: string): Promise<MysteryBox> => {
  const res = await axiosInstance.get<MysteryBox>(`/api/v1/mystery-boxes/${id}`);
  return res.data;
};

export const purchaseMysteryBox = async (
  id: string,
  input: PurchaseMysteryBoxInput
): Promise<MysteryBoxPurchase> => {
  const res = await axiosInstance.post<MysteryBoxPurchase>(
    `/api/v1/mystery-boxes/${id}/purchase`,
    input
  );
  return res.data;
};

export const getMyPurchases = async (): Promise<MysteryBoxPurchase[]> => {
  const res = await axiosInstance.get<MysteryBoxPurchase[]>("/api/v1/mystery-boxes/purchases/me");
  return res.data;
};

export const getAdminMysteryBoxes = async (): Promise<MysteryBox[]> => {
  const res = await axiosInstance.get<MysteryBox[]>("/api/v1/admin/mystery-boxes");
  return res.data;
};

export const createMysteryBox = async (data: Partial<MysteryBox>): Promise<MysteryBox> => {
  const res = await axiosInstance.post<MysteryBox>("/api/v1/admin/mystery-boxes", data);
  return res.data;
};

export const updateMysteryBox = async (
  id: string,
  data: Partial<MysteryBox>
): Promise<MysteryBox> => {
  const res = await axiosInstance.put<MysteryBox>(`/api/v1/admin/mystery-boxes/${id}`, data);
  return res.data;
};
