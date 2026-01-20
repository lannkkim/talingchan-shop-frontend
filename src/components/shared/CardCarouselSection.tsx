"use client";

import { Card, Skeleton, Tag, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";
import { Card as CardType } from "@/types/card";
import { useTranslations } from "next-intl";

const { Text, Title } = Typography;

export type BoxFlatCode = "S" | "M";

interface CardCarouselSectionProps {
  cards: CardType[];
  isLoading: boolean;
  getCardImageUrl: (imageName: string | null | undefined) => string;
  title?: string;
  coverImage?: string;
  boxFlatCode?: BoxFlatCode;
  viewAllLink?: string;
}

// Small card component (S size) - vertical layout based on mockup แยกใบ section
function SmallCardItem({
  card,
  getCardImageUrl,
}: {
  card: CardType;
  getCardImageUrl: (imageName: string | null | undefined) => string;
}) {
  return (
    <Card
      hoverable
      className="flex-shrink-0 w-[200px] overflow-hidden border border-black hover:shadow-lg transition-all duration-300 bg-white rounded-lg"
      cover={
        <div className="relative h-[260px] bg-white">
          <Image
            src={getCardImageUrl(card.image_name)}
            alt={card.name}
            fill
            className="object-contain p-3"
            sizes="200px"
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
        body: { padding: "12px" },
        header: { border: "1px solid black" },
      }}
      style={{ border: "1px solid black" }}
    >
      <Text className="text-sm text-gray-800 line-clamp-2 font-medium block mb-2">
        {card.name}
      </Text>
      <Text className="text-base font-bold text-gray-900 block">฿ 41,200</Text>
      <div className="flex items-center gap-2 mt-2">
        <Tag color="blue" className="m-0 text-xs">
          แยกใบ
        </Tag>
        <Tag color="orange" className="m-0 text-xs">
          sec
        </Tag>
        <Text className="text-xs text-gray-400 ml-auto">เหลือ 12</Text>
      </div>
    </Card>
  );
}

// Large card component (M size) - horizontal layout based on mockup ประมูล section
function LargeCardItem({
  card,
  getCardImageUrl,
}: {
  card: CardType;
  getCardImageUrl: (imageName: string | null | undefined) => string;
}) {
  return (
    <Card
      hoverable
      className="flex-shrink-0 w-[420px] overflow-hidden hover:shadow-lg transition-all duration-300 bg-white rounded-lg"
      styles={{ body: { padding: 0 } }}
      style={{ border: "1px solid black" }}
    >
      <div className="flex h-[280px]">
        {/* Image Section */}
        <div className="relative w-[180px] h-full overflow-hidden flex-shrink-0 rounded-l-lg">
          <Image
            src={getCardImageUrl(card.image_name)}
            alt={card.name}
            fill
            className="object-cover"
            sizes="180px"
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
          <Title level={4} className="!mb-2 !text-lg line-clamp-1">
            {card.name || "อาเธอร์"}
          </Title>

          <div className="flex items-baseline gap-2 mb-2">
            <Text className="text-gray-500 text-sm">เปิดที่</Text>
            <Text className="text-lg font-bold text-gray-900">฿ 41,200</Text>
            <Text className="text-gray-400 text-xs">บิดขั้นต่ำ:10</Text>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Tag color="orange" className="m-0 text-xs font-medium">
              สูด
            </Tag>
            <Tag color="purple" className="m-0 text-xs font-medium">
              sec
            </Tag>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div>รายละเอียดสินค้า</div>
            <div>
              จำนวน <span className="font-medium">4</span> ใบ
            </div>
            <div>หมดเวลาใน</div>
          </div>

          <div className="mt-auto pt-3">
            <div className="inline-block border border-black rounded px-4 py-2">
              <Text className="text-lg font-mono font-medium">24:02:32</Text>
            </div>
          </div>

          <Text className="text-xs text-gray-400 mt-2">เหลือ 1</Text>
        </div>
      </div>
    </Card>
  );
}

// Cover placeholder card
function CoverPlaceholder() {
  return (
    <div className="flex-shrink-0 w-[140px] h-[280px] border-2 border-dashed border-black rounded-lg bg-white flex items-center justify-center">
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

  // Determine card dimensions based on box size
  const isLarge = boxFlatCode === "M";
  const cardWidth = isLarge ? "w-[420px]" : "w-[200px]";
  const cardHeight = isLarge ? "h-[280px]" : "h-[340px]";

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
        <div
          className="flex-shrink-0 w-[140px] h-[280px] rounded-lg bg-white flex items-center justify-center overflow-hidden"
          style={{ border: "1px solid black" }}
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              width={140}
              height={280}
              className="object-cover w-full h-full"
            />
          ) : (
            <Text className="text-gray-400 text-sm">Cover</Text>
          )}
        </div>

        {/* Scrollable Cards */}
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide py-2 flex-grow"
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
                  />
                ) : (
                  <SmallCardItem
                    key={`${card.card_id}-${index}`}
                    card={card}
                    getCardImageUrl={getCardImageUrl}
                  />
                ),
              )}
        </div>
      </div>
    </div>
  );
}
