import axiosInstance from "@/lib/axios";
import { Address, CreateAddressInput } from "@/types/address";

const BASE_URL = "api/v1/addresses";

export const getAddresses = async (): Promise<Address[]> => {
  const response = await axiosInstance.get(BASE_URL);
  return response.data;
};

export const createAddress = async (
  input: CreateAddressInput
): Promise<Address> => {
  const response = await axiosInstance.post(BASE_URL, input);
  return response.data;
};

export const deleteAddress = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}/${id}`);
};

export const setDefaultAddress = async (id: number): Promise<void> => {
  await axiosInstance.put(`${BASE_URL}/${id}/default`);
};
