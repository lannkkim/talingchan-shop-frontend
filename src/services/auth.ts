import axiosInstance from "@/lib/axios";
import { AuthResponse, LoginInput, RegisterInput } from "@/types/auth";

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const response = await axiosInstance.post("api/v1/auth/login", input);
  return response.data;
};

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const response = await axiosInstance.post("api/v1/auth/register", input);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post("api/v1/auth/logout");
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await axiosInstance.post("api/v1/auth/refresh-token");
  return response.data;
};
