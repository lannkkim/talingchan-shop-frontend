export interface Type {
  product_type_id: string;
  product_type_code?: string; // Added code
  code: string;
  name: string;
  status: string;
}

export interface SellType {
  sell_type_id: string;
  sell_type_code?: string; // Added code
  code: string;
  name: string;
}

export interface BuyType {
  buy_type_id: string;
  buy_type_code?: string; // Added code
  code: string;
  name: string;
}

export interface BoxFlat {
  box_flat_id: string;
  box_flat_code: string;
  box_flat_description: string;
  is_active: boolean;
}
