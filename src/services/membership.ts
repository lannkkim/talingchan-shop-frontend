import axiosInstance from "@/lib/axios";
import type { MembershipPlan, UserMembership, PurchaseMembershipInput } from "@/types/membership";

export const getMembershipPlans = async (): Promise<MembershipPlan[]> => {
  const res = await axiosInstance.get<MembershipPlan[]>("/api/v1/memberships/plans");
  return res.data;
};

export const getMyMembership = async (): Promise<UserMembership | null> => {
  const res = await axiosInstance.get<UserMembership | null>("/api/v1/memberships/me");
  return res.data;
};

export const purchaseMembership = async (input: PurchaseMembershipInput): Promise<UserMembership> => {
  const res = await axiosInstance.post<UserMembership>("/api/v1/memberships/purchase", input);
  return res.data;
};

export const getAdminMemberships = async (): Promise<UserMembership[]> => {
  const res = await axiosInstance.get<UserMembership[]>("/api/v1/admin/memberships");
  return res.data;
};
