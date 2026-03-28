export interface MysteryBoxItem {
  card_id?: string;
  name: string;
  rarity: string;
  probability: number;
}

export interface MysteryBox {
  mystery_box_id: string;
  name: string;
  description?: string;
  price: string;
  image_url?: string;
  items: MysteryBoxItem[];
  is_active: boolean;
  stock: number;
  created_at: string;
}

export interface MysteryBoxPurchase {
  mystery_box_purchase_id: string;
  mystery_box_id: string;
  user_id: string;
  quantity: number;
  total_paid: string;
  items_won: MysteryBoxItem[];
  purchased_at: string;
  mystery_box?: MysteryBox;
}

export interface PurchaseMysteryBoxInput {
  quantity: number;
}
