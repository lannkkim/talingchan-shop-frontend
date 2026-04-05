import axiosInstance from "@/lib/axios";
import type { UserBank, AddBankRequest, UpdateBankRequest } from "@/types/user-bank";

export const getMyBanks = async (): Promise<UserBank[]> => {
  const res = await axiosInstance.get<UserBank[]>("/api/v1/users/me/banks");
  return res.data;
};

export const addBank = async (data: AddBankRequest): Promise<UserBank> => {
  const res = await axiosInstance.post<UserBank>("/api/v1/users/me/banks", data);
  return res.data;
};

export const updateBank = async (id: string, data: UpdateBankRequest): Promise<UserBank> => {
  const res = await axiosInstance.put<UserBank>(`/api/v1/users/me/banks/${id}`, data);
  return res.data;
};

export const deleteBank = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/users/me/banks/${id}`);
};
