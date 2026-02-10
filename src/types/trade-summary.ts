
export interface TradeOfferSummary {
    offerType: "single" | "deck" | "bot" | null;
    items: Array<{
        itemId?: string;
        name: string;
        quantity: number;
        rarity?: string;
        image_name?: string;
    }>;
    referencePrice?: number;
    isValid: boolean;
    validationErrors?: string[];
}

export interface TradeRequestOptionSummary {
    optionIndex: number;
    requestType: "product" | "text" | null;
    details: {
        productId?: string;
        name?: string; // Product name or generic string
        bulletPoints?: string[]; // For text type
        images?: string[]; // For product type
    };
    cashAdjustment?: number; // Can be null if not set
    note?: string;
    isValid: boolean;
    validationErrors?: string[];
}

export interface TradeConditionsSummary {
    requireEscrow: boolean;
    allowDirectTrade: boolean;
}

export interface TradeMetaSummary {
    tradeTitle: string;
    tradeDescription?: string;
    tradeExpireAt: string; // ISO Date String
    totalRequestOptions: number;
    tradeStatusPreview: "draft" | "ready" | "invalid";
    createdAt: number; // Timestamp
    isReadyToSubmit: boolean;
}

export interface TradeValidationSummary {
    isValid: boolean;
    blockingErrors: string[];
    warnings: string[];
}

export interface TradeSummary {
    offer: TradeOfferSummary;
    requests: TradeRequestOptionSummary[];
    conditions: TradeConditionsSummary;
    meta: TradeMetaSummary;
    validation: TradeValidationSummary;
}
