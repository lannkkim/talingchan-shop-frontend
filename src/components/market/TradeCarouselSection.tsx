"use client";

import { Skeleton, Typography } from "antd";
import Link from "next/link";
import { Product } from "@/types/product";
import TradeProductCard from "./TradeProductCard";
import { useTranslations } from "next-intl";

const { Title } = Typography;

interface TradeCarouselSectionProps {
  products: Product[];
  isLoading: boolean;
  title?: string;
  viewAllLink?: string;
  hideHeader?: boolean;
  onProductClick?: (product: Product) => void;
  className?: string;
}

export default function TradeCarouselSection({
  products,
  isLoading,
  title = "แลก-เปลี่ยน",
  viewAllLink = "/market/trade",
  hideHeader = false,
  onProductClick,
  className = "",
}: TradeCarouselSectionProps) {
  const t = useTranslations("Market");

  return (
    <div className={`w-full py-6 ${className}`}>
      {!hideHeader && (
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
      )}

      <div className="flex gap-4 px-4">
        {/* Cover Image Removed as per request (or kept? User didn't specify covers for trade, usually trade doesn't have cover image). 
            Taking liberty to NOT include cover image for now to maximize space for cards. 
        */}

        {/* Scrollable Cards */}
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide py-3 flex-grow px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[420px]">
                   <Skeleton.Image active className="!w-full !h-[280px]" />
                   <Skeleton active paragraph={{ rows: 2 }} className="mt-2" />
                </div>
              ))
            : products.map((product) => (
                <div key={product.product_id} className="flex-shrink-0 w-[450px] sm:w-[500px]">
                   <TradeProductCard 
                      product={product} 
                      onClick={(p) => onProductClick && onProductClick(p)} 
                   />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
