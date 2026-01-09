"use client";

import { useMarketPage } from "@/components/market/useMarketPage";
import MarketPageUI from "@/components/market/MarketPageUI";

export default function MarketPage() {
  const {
    products,
    isLoadingProducts,
    cards,
    isLoadingCards,
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
      carouselRef={carouselRef}
      handleScroll={handleScroll}
      getCardImageUrl={getCardImageUrl}
      getProductImage={getProductImage}
      getActivePrice={getActivePrice}
    />
  );
}
