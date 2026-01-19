export interface ShopProfile {
  shop_id: number;
  user_id: number;
  level: string;
  is_verified: boolean;
  is_stock_check_enabled: boolean;
  shop_profile: {
    shop_profile_id: number;
    shop_name: string;
    shop_display?: string;
    shop_email?: string;
    shop_phone?: string;
    owner_name?: string;
  };
}

export interface UpdateShopProfileInput {
  shop_name: string;
  shop_display?: string;
  shop_email?: string;
  shop_phone?: string;
}
