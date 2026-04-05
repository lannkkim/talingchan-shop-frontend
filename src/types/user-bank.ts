export interface UserBank {
  user_bank_id: string;
  bank_id: string;
  bank_name?: string;
  bank_account: string;
  account_name?: string;
  branch?: string;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AddBankRequest {
  bank_id: string;
  bank_account: string;
  account_name: string;
  branch?: string;
  is_default?: boolean;
}

export interface UpdateBankRequest {
  account_name?: string;
  branch?: string;
  is_default?: boolean;
}
