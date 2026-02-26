export interface RevenueDetail {
  revenue_id: string;
  order_code: string;
  total_amount: string;
  fee_rate: string;
  fee_amount: string;
  net_revenue: string;
  created_at: string;
}

export interface ShopRevenueSummary {
  total_revenue: string;
  total_fee: string;
  net_revenue: string;
  order_count: number;
}

export interface ShopRevenueDashboardResponse {
  summary: ShopRevenueSummary;
  revenues: RevenueDetail[];
}
