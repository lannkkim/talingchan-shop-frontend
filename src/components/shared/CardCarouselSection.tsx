"use client";

import { Card, Skeleton, Tag, Typography } from "antd";
import Image from "next/image";
import { Link } from "@/navigation";
import { Card as CardType } from "@/types/card";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/ThemeContext";

const { Text, Title } = Typography;

export type BoxFlatCode = "S" | "M";

interface CardCarouselSectionProps {
  cards: CardType[];
  isLoading: boolean;
  getCardImageUrl: (imageName: string | null | undefined, size?: "thumb" | "medium" | "original") => string;
  title?: string;
  coverImage?: string;
  boxFlatCode?: BoxFlatCode;
  viewAllLink?: string;
}

// Small card component (S size) - vertical layout based on mockup แยกใบ section
function SmallCardItem({
  card,
  getCardImageUrl,
  isDark,
}: {
  card: CardType;
  getCardImageUrl: (imageName: string | null | undefined, size?: "thumb" | "medium" | "original") => string;
  isDark: boolean;
}) {
  const bgColor = isDark ? "#1f2937" : "#ffffff";
  return (
    <Card
      hoverable
      className="flex-shrink-0 w-[200px] h-[300px] overflow-hidden border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 rounded-lg"
      cover={
        <div className="relative h-[180px]" style={{ background: bgColor }}>
          <Image
            src={getCardImageUrl(card.image_name, "thumb")}
            alt={card.name}
            fill
            className="object-contain p-3"
            sizes="200px"
            unoptimized
          />
          {card.rare && (
            <Tag
              color="gold"
              className="absolute top-2 left-2 m-0 font-bold text-xs"
            >
              {card.rare}
            </Tag>
          )}
        </div>
      }
      styles={{
        body: {
          padding: "8px",
          height: "80px",
          overflow: "hidden",
          background: bgColor,
        },
      }}
      style={{
        border: "1px solid #e5e7eb",
        height: "280px",
        background: bgColor,
      }}
    >
      <Text className="text-xs text-gray-800 dark:text-gray-100 line-clamp-1 font-medium block mb-1">
        {card.name}
      </Text>
      <Link href={`/market/cards/${card.card_id}`} className="text-sm font-semibold text-black dark:text-white hover:text-[#DC143C] transition-colors block">
        ดูราคา →
      </Link>
      <div className="flex items-center gap-1 mt-1">
        {card.rare && (
          <Tag color="gold" className="m-0 text-[10px]">
            {card.rare}
          </Tag>
        )}
      </div>
    </Card>
  );
}

// Large card component (M size) - horizontal layout based on mockup ประมูล section
function LargeCardItem({
  card,
  getCardImageUrl,
  isDark,
}: {
  card: CardType;
  getCardImageUrl: (imageName: string | null | undefined, size?: "thumb" | "medium" | "original") => string;
  isDark: boolean;
}) {
  const bgColor = isDark ? "#1f2937" : "#ffffff";
  return (
    <Card
      hoverable
      className="flex-shrink-0 w-[500px] overflow-hidden border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-300 rounded-lg"
      styles={{ body: { padding: 0, background: bgColor } }}
      style={{ border: "1px solid #e5e7eb", background: bgColor }}
    >
      <div className="flex h-[300px]">
        {/* Image Section - Square 280x280 */}
        <div className="relative w-[280px] h-full overflow-hidden flex-shrink-0 rounded-l-lg">
          <Image
            src={getCardImageUrl(card.image_name, "medium")}
            alt={card.name}
            fill
            className="object-cover scale-x-185 scale-y-185 object-top"
            sizes="280px"
            unoptimized
          />
          {card.rare && (
            <Tag
              color="gold"
              className="absolute top-2 left-2 m-0 font-bold text-xs z-10"
            >
              {card.rare}
            </Tag>
          )}
        </div>

        {/* Details Section */}
        <div className="flex-1 p-4 flex flex-col">
          <Title
            level={4}
            className="!mb-2 !text-lg line-clamp-1 dark:!text-white"
          >
            {card.name}
          </Title>

          <div className="flex items-center gap-2 mb-3">
            {card.rare && (
              <Tag color="gold" className="m-0 text-xs font-medium">
                {card.rare}
              </Tag>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <div>{card.color && <span>สี: <span className="font-medium">{card.color}</span></span>}</div>
            <div>{card.type && <span>ประเภท: <span className="font-medium">{card.type}</span></span>}</div>
          </div>

          <div className="mt-auto pt-3">
            <Link
              href={`/market/cards/${card.card_id}`}
              className="inline-block bg-black text-white text-sm font-semibold px-4 py-2 hover:bg-gray-800 transition-colors"
            >
              ดูราคาและรายละเอียด →
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Cover placeholder card
function CoverPlaceholder() {
  return (
    <div className="flex-shrink-0 w-[140px] h-[280px] border-2 border-dashed border-gray-300 rounded-lg bg-white flex items-center justify-center">
      <Text className="text-gray-400 text-sm">Cover</Text>
    </div>
  );
}

export default function CardCarouselSection({
  cards,
  isLoading,
  getCardImageUrl,
  title = "ประมูล",
  coverImage,
  boxFlatCode = "S",
  viewAllLink = "/cards",
}: CardCarouselSectionProps) {
  const t = useTranslations("Market");
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";

  // Determine card dimensions based on box size
  const isLarge = boxFlatCode === "M";
  const cardWidth = isLarge ? "w-[420px]" : "w-[200px]";
  const cardHeight = isLarge ? "h-[280px]" : "h-[280px]";

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-4 px-8">
        <Title level={4} className="!mb-0 !text-xl">
          {title}
        </Title>
        <Link
          href={viewAllLink}
          className="text-gray-500 hover:text-blue-600 transition-colors text-sm"
        >
          {t("viewAll") || "ดูเพิ่มเติม"}
        </Link>
      </div>

      <div className="flex gap-4 px-4">
        {/* Cover Image */}
        {coverImage && (
          <Card
            className="flex-shrink-0 w-[200px] overflow-hidden shadow-lg bg-white"
            style={{ border: "1px solid #e5e7eb" }}
            cover={
              <div className="relative h-[320px]">
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            }
            styles={{ body: { display: "none" } }}
          />
        )}

        {/* Scrollable Cards */}
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide py-3 flex-grow"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: isLarge ? 3 : 5 }).map((_, i) => (
                <Card key={i} className={`flex-shrink-0 ${cardWidth}`}>
                  <Skeleton.Image active className={`!w-full ${cardHeight}`} />
                  <Skeleton active paragraph={{ rows: 2 }} className="mt-2" />
                </Card>
              ))
            : cards.map((card: CardType, index: number) =>
                isLarge ? (
                  <LargeCardItem
                    key={`${card.card_id}-${index}`}
                    card={card}
                    getCardImageUrl={getCardImageUrl}
                    isDark={isDark}
                  />
                ) : (
                  <SmallCardItem
                    key={`${card.card_id}-${index}`}
                    card={card}
                    getCardImageUrl={getCardImageUrl}
                    isDark={isDark}
                  />
                ),
              )}
        </div>
      </div>
    </div>
  );
}
