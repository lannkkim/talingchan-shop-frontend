"use client";

import { useMarketPage } from "@/components/market/useMarketPage";
import MarketPageUI from "@/components/market/MarketPageUI";
import { ConfigProvider } from "antd";
import { Product } from "@/types/product";

export default function LandingPage() {
  const {
    products,
    isLoadingProducts,
    cards,
    isLoadingCards,
    tradeProducts,
    isLoadingTrades,
    carouselRef,
    handleScroll,
    getCardImageUrl,
    getProductImage,
    getActivePrice,
  } = useMarketPage();

  return (
    <MarketPageUI
      products={products}
      isLoadingProducts={isLoadingProducts}
      cards={cards}
      isLoadingCards={isLoadingCards}
      tradeProducts={tradeProducts}
      isLoadingTrades={isLoadingTrades}
      carouselRef={carouselRef}
      handleScroll={handleScroll}
      getCardImageUrl={getCardImageUrl}
      getProductImage={getProductImage}
      getActivePrice={getActivePrice}
    />
  );
}
