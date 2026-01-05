export interface Card {
  card_id: number;
  name: string;
  type: string;
  print: string;
  rare: string;
  soi: number;
  custom_limit?: number | null;
  ex?: string | null;
  cost?: number | null;
  gem?: number | null;
  power?: number | null;
  symbol?: string | null;
  subtype?: string | null;
  color?: string | null;
  main_effect?: string | null;
  favor_text?: string | null;
  image_name?: string | null;
}
