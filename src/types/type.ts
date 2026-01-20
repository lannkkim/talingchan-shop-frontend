export interface Type {
  product_type_id: number;
  code: string;
  name: string;
  status: string;
}

export interface SellType {
  sell_type_id: number;
  code: string;
  name: string;
}

export interface BuyType {
  buy_type_id: number;
  code: string;
  name: string;
}

export interface BoxFlat {
  box_flat_id: number;
  box_flat_code: string;
  box_flat_description: string;
  is_active: boolean;
}
