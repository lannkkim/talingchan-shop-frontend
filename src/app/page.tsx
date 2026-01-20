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
    carouselRef,
    handleScroll,
    getCardImageUrl,
    getProductImage,
    getActivePrice,
  } = useMarketPage();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
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
    </ConfigProvider>
  );
}
