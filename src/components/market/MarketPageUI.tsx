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
import TradeCarouselSection from "./TradeCarouselSection";
import AuctionCarouselSection from "./AuctionCarouselSection";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { AuctionProduct } from "@/types/auction";

const { Content } = Layout;

interface MarketPageUIProps {
  products: Product[];
  isLoadingProducts: boolean;
  cards: CardType[];
  isLoadingCards: boolean;
  tradeProducts: Product[];
  isLoadingTrades: boolean;
  auctionProducts: AuctionProduct[];
  isLoadingAuctions: boolean;
  carouselRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  getCardImageUrl: (imageName: string | null | undefined, size?: "thumb" | "medium" | "original") => string;
  getProductImage: (product: Product, size?: "thumb" | "medium" | "original") => string;
  getActivePrice: (product: Product) => number | null;
}

export default function MarketPageUI({
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
}: MarketPageUIProps) {
  const t = useTranslations("Market");
  const router = useRouter();

  return (
    <Layout className="min-h-screen">
      <PageHeader title="" />

      <Content>
        {/* Hero Banner Component */}
        <HeroBanner />
        {/* Product Carousel Component */}
        <div className="max-w-7xl mx-auto">


          {/* ประมูล - Auction (Real auction products) */}
          <AuctionCarouselSection
            products={auctionProducts}
            isLoading={isLoadingAuctions}
            title={t("auction")}
            viewAllLink="/market/auction"
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

          {/* แลก-เปลี่ยน - Exchange (Real Trade Data) */}
          <TradeCarouselSection
            products={tradeProducts}
            isLoading={isLoadingTrades}
            title={t("exchange")}
            onProductClick={() => router.push("/market/trade")}
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
