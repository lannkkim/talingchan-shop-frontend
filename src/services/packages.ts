import axios from "@/lib/axios";
import { CardInput } from "./product"; // Reuse CardInput

export interface CreatePackageTradeInput {
  tradeType: "MIXED";
  forceCentralTrade: boolean;

  // Listing Info
  name: string;
  started_at: string;
  ended_at: string;

  // Offer Side (What I Have - One unified box with sections)
  sections: {
    sectionType: "SINGLE" | "DECK" | "BOT";
    items: {
      itemType: "PRODUCT";
      productId: string;
      quantity?: number;
    }[];
    addCash?: number; // Per section cash? Or per box? Prompt says "Add Money per Section"
  }[];

  // Request Side (What I Want - Max 3 items)
  want: {
    type: "PRODUCT" | "TEXT";
    // If Text
    bullets?: string[];
    // If Product (Bundle)
    // "Format 1: Product... Bundle... Logic same as Offer"
    bundle?: {
      sections: {
        sectionType: "SINGLE" | "DECK" | "BOT";
        items: { productId: string }[];
      }[];
      addCash?: number;
    };
  }[];
}

export const createTrade = async (data: CreatePackageTradeInput) => {
  const response = await axios.post("/api/v1/packages/trade", data);
  return response.data;
};
