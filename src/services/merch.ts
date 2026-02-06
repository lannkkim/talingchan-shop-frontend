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
