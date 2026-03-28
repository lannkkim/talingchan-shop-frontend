export interface DataExport {
  user_id: string;
  profile: Record<string, unknown>;
  orders: Record<string, unknown>[];
  addresses: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
  favorites: Record<string, unknown>[];
  exported_at: string;
}

export interface DeletionRequest {
  message: string;
  scheduled_at: string;
}
