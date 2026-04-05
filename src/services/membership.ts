import axiosInstance from "@/lib/axios";

export interface MembershipReward {
  reward_id: string;
  name: string;
  description?: string;
  points_required: number;
  is_active: boolean;
}

export interface UserMembershipInfo {
  level: string;
  points: number;
  total_earned: number;
}

export interface PointHistoryItem {
  id: string;
  action: string;
  points: number;
  created_at: string;
}

export interface RedemptionItem {
  redemption_id: string;
  reward_id: string;
  redeemed_at: string;
  reward?: MembershipReward;
}

// GET /membership/rewards — list available rewards (public)
export const getMembershipRewards = async (): Promise<MembershipReward[]> => {
  const res = await axiosInstance.get<MembershipReward[]>("/api/v1/membership/rewards");
  return res.data ?? [];
};

// GET /membership — current user's membership/points info
export const getMyMembership = async (): Promise<UserMembershipInfo | null> => {
  const res = await axiosInstance.get<UserMembershipInfo>("/api/v1/membership");
  return res.data;
};

// GET /membership/points — point transaction history
export const getPointHistory = async (): Promise<PointHistoryItem[]> => {
  const res = await axiosInstance.get<PointHistoryItem[]>("/api/v1/membership/points");
  return res.data ?? [];
};

// POST /membership/rewards/:id/redeem — redeem a reward
export const redeemReward = async (rewardId: string): Promise<RedemptionItem> => {
  const res = await axiosInstance.post<RedemptionItem>(`/api/v1/membership/rewards/${rewardId}/redeem`);
  return res.data;
};

// GET /membership/redemptions — user's redemption history
export const getMyRedemptions = async (): Promise<RedemptionItem[]> => {
  const res = await axiosInstance.get<RedemptionItem[]>("/api/v1/membership/redemptions");
  return res.data ?? [];
};
