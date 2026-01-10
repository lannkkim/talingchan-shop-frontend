"use client";

import { Layout } from "antd";
import { Card as CardType } from "@/types/card";
import { Product } from "@/types/product";
import PageHeader from "@/components/shared/PageHeader";
import HeroBanner from "./HeroBanner";
import ProductCarouselSection from "./ProductCarouselSection";
import CardCarouselSection from "./CardCarouselSection";
import CategoryGridSection from "./CategoryGridSection";
import MarketFooter from "./MarketFooter";

const { Content } = Layout;

interface MarketPageUIProps {
  products: Product[];
  isLoadingProducts: boolean;
  cards: CardType[];
  isLoadingCards: boolean;
  carouselRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  getCardImageUrl: (imageName: string | null | undefined) => string;
  getProductImage: (product: Product) => string;
  getActivePrice: (product: Product) => number | null;
}

export default function MarketPageUI({
  products,
  isLoadingProducts,
  cards,
  isLoadingCards,
  carouselRef,
  handleScroll,
  getCardImageUrl,
  getProductImage,
  getActivePrice,
}: MarketPageUIProps) {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <PageHeader title="Market" />

      <Content>
        {/* Hero Banner Component */}
        <HeroBanner />
        {/* Product Carousel Component */}
        <div className="mt-8">
          <ProductCarouselSection
            products={products}
            isLoading={isLoadingProducts}
            carouselRef={carouselRef}
            handleScroll={handleScroll}
            getProductImage={getProductImage}
            getActivePrice={getActivePrice}
          />
        </div>
        
        {/* Card Carousel Component */}
        <CardCarouselSection
          cards={cards}
          isLoading={isLoadingCards}
          getCardImageUrl={getCardImageUrl}
          title="ประมูล"
          coverImage="/images/auction.png"

        />
        <CardCarouselSection
          cards={cards}
          isLoading={isLoadingCards}
          getCardImageUrl={getCardImageUrl}
          title="การ์ดแยกใบ"
          coverImage="/images/single_card.png"
        />
        <CardCarouselSection
          cards={cards}
          isLoading={isLoadingCards}
          getCardImageUrl={getCardImageUrl}
          title="การ์ดเด็ค"
          coverImage="/images/deck_card.png"

        />
        {/* Category Grid Component */}
        <CategoryGridSection />
      </Content>

      {/* Footer Component */}
      <MarketFooter />
    </Layout>
  );
}
