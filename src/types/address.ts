export interface AddressType {
  address_type_id: number;
  name: string;
  description?: string;
}

export interface Address {
  address_id: number;
  user_id: number;
  name: string;
  address: string;
  sub_district: string;
  district: string;
  province: string;
  zipcode: string;
  is_default: boolean;
  address_type_id: number;
  created_at: string;
  updated_at: string;
  address_type?: AddressType;
}

export interface CreateAddressInput {
  name: string;
  address: string;
  sub_district: string;
  district: string;
  province: string;
  zipcode: string;
  is_default?: boolean;
  address_type_id?: number;
}
