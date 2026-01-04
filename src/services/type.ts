import axiosInstance from "@/lib/axios";
import { Type } from "@/types/type";

export const getTypes = async (): Promise<Type[]> => {
  const response = await axiosInstance.get<Type[]>("/api/v1/types/");
  return response.data;
};
