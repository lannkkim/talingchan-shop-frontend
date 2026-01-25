export interface AddressType {
  address_type_id: string;
  address_type_code?: string; // Added code
  name: string;
  description?: string;
}

export interface Address {
  address_id: string;
  address_code?: string; // Added code
  user_id: string;
  name: string;
  address: string;
  sub_district: string;
  district: string;
  province: string;
  zipcode: string;
  phone: string;
  is_default: boolean;
  address_type_id: string;
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
  phone: string;
  is_default?: boolean;
  address_type_id?: string;
}
