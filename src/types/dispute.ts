import type { User } from "./auth";
import type { Order } from "./order";

export interface Dispute {
  dispute_id: string;
  order_id: string;
  complainant_id: string;
  reason: string;
  description?: string;
  evidence_images?: string[];
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";
  resolution?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
  complainant?: User;
  order?: Order;
}

export interface CreateDisputeInput {
  reason: string;
  description?: string;
  evidence_images?: string[];
}

export interface ResolveDisputeInput {
  resolution: string;
  outcome: "BUYER_WINS" | "SELLER_WINS" | "MUTUAL";
}
