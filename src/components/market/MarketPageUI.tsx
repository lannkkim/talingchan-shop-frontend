"use client";

import { Layout } from "antd";
import { Card as CardType } from "@/types/card";
import { Product } from "@/types/product";
import PageHeader from "@/components/shared/PageHeader";
import HeroBanner from "./HeroBanner";
import ProductCarouselSection from "./ProductCarouselSection";
import CardCarouselSection from "@/components/shared/CardCarouselSection";
import CategoryGridSection from "./CategoryGridSection";
import MarketFooter from "./MarketFooter";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Market");

  return (
    <Layout className="min-h-screen">
      <PageHeader title="" />

      <Content>
        {/* Hero Banner Component */}
        <HeroBanner />
        {/* Product Carousel Component */}
        <div className="max-w-7xl mx-auto">


          {/* ประมูล - Auction (Large Cards - M) */}
          <CardCarouselSection
            cards={cards}
            isLoading={isLoadingCards}
            getCardImageUrl={getCardImageUrl}
            title={t("auction")}
            coverImage="/images/auction.png"
            boxFlatCode="M"
          />

          {/* แยกใบ - Single Cards (Small Cards - S) */}
          <CardCarouselSection
            cards={cards}
            isLoading={isLoadingCards}
            getCardImageUrl={getCardImageUrl}
            title={t("singleCards")}
            coverImage="/images/single_card.png"
            boxFlatCode="S"
          />

          {/* ชุดการ์ด - Deck Cards (Large Cards - M) */}
          <CardCarouselSection
            cards={cards}
            isLoading={isLoadingCards}
            getCardImageUrl={getCardImageUrl}
            title={t("deckCards")}
            coverImage="/images/deck_card.png"
            boxFlatCode="M"
          />

          {/* แลก-เปลี่ยน - Exchange (Small Cards - S) */}
          <CardCarouselSection
            cards={cards}
            isLoading={isLoadingCards}
            getCardImageUrl={getCardImageUrl}
            title={t("exchange")}
            coverImage="/images/exchange.png"
            boxFlatCode="S"
          />

          {/* Category Grid Component */}
          <CategoryGridSection />
        </div>
      </Content>

      {/* Footer Component */}
      <MarketFooter />
    </Layout>
  );
}
