export interface LedgerEntry {
  ledger_entry_id: string;
  account_type: string;
  owner_id: string;
  entry_type: "CREDIT" | "DEBIT";
  amount: string;
  balance_after: string;
  reference_type: string;
  reference_id: string;
  description?: string;
  created_at: string;
}

export interface SellerBalance {
  shop_id: string;
  balance: string;
  currency: string;
}
