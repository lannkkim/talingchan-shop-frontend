"use client";

import { useMarketPage } from "@/components/market/useMarketPage";
import MarketPageUI from "@/components/market/MarketPageUI";

export default function LandingPage() {
  const {
    products,
    isLoadingProducts,
    cards,
    isLoadingCards,
    tradeProducts,
    isLoadingTrades,
    auctionProducts,
    isLoadingAuctions,
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
      auctionProducts={auctionProducts}
      isLoadingAuctions={isLoadingAuctions}
      carouselRef={carouselRef}
      handleScroll={handleScroll}
      getCardImageUrl={getCardImageUrl}
      getProductImage={getProductImage}
      getActivePrice={getActivePrice}
    />
  );
}
