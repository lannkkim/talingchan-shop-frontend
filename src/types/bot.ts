export interface BotCatalog {
  bot_catalog_id: string;
  name: string;
  description?: string;
  price: string;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface CreateBotInput {
  name: string;
  description?: string;
  price: string;
  features: string[];
}
