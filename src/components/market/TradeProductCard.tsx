"use client";

import { Card, Tag, Typography } from "antd";
import Image from "next/image";
import { Product } from "@/types/product";
import { SwapOutlined, UserOutlined } from "@ant-design/icons";
import { getCardImageUrl } from "@/utils/image";
import { useTheme } from "@/contexts/ThemeContext";
import FavoriteButton from "@/components/market/FavoriteButton";

const { Text, Title } = Typography;

interface TradeProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function TradeProductCard({ product, onClick }: TradeProductCardProps) {
  const { themeMode } = useTheme();
  const isDark = themeMode === "dark";
  const bgColor = isDark ? "#1f2937" : "#ffffff";

  // Helpers
  const getProductImage = (product: Product) => {
    const firstStock = product.product_stock_card?.[0];
    if (!firstStock) return null;
    return firstStock.card?.image_name || firstStock.stock_card?.card?.image_name || null;
  };

  const imageName = getProductImage(product);
  const imageUrl = getCardImageUrl(imageName, "thumb");
  
  // Extract info
  const firstCard = product.product_stock_card?.[0]?.card || product.product_stock_card?.[0]?.stock_card?.card;
  const totalCards = product.product_stock_card?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const ownerName = product.users?.shop?.shop_profile?.shop_name || product.users?.username || "Unknown";

  return (
    <Card
      hoverable
      onClick={() => onClick(product)}
      className="flex-shrink-0 w-full overflow-hidden hover:shadow-lg transition-all duration-300 rounded-lg group"
      styles={{ body: { padding: 0, background: bgColor } }}
      style={{ border: "1px solid black", background: bgColor }}
    >
      <div className="flex h-[280px] sm:h-[300px]">
        {/* Image Section - Left */}
        <div className="relative w-[40%] sm:w-[280px] h-full overflow-hidden flex-shrink-0 border-r border-gray-100 dark:border-gray-700">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 40vw, 280px"
            unoptimized
          />
          
          {/* Rarity Tag (Top Left) */}
          {firstCard?.rare && (
            <Tag
              color="gold"
              className="absolute top-2 left-2 m-0 font-bold text-xs z-10 shadow-md"
            >
              {firstCard.rare}
            </Tag>
          )}

          {/* Favorite Button (Top Right) */}
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton productId={product.product_id} />
          </div>

           {/* Trade Banner */}
          <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-center py-1 text-xs backdrop-blur-sm">
             <SwapOutlined className="mr-1" /> Available for Trade
          </div>
        </div>

        {/* Details Section - Right */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <Title
                level={4}
                className="!mb-2 !text-lg line-clamp-1 dark:!text-white group-hover:text-blue-600 transition-colors"
                title={product.name}
            >
                {product.name}
            </Title>

            {/* Owner Info */}
            <div className="flex items-center gap-2 mb-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg w-fit">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserOutlined style={{ fontSize: '12px' }} />
                </div>
                <div className="flex flex-col">
                    <Text className="text-xs text-gray-500 dark:text-gray-400 leading-none">Owner (ผู้เสนอ)</Text>
                    <Text className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                        {ownerName}
                    </Text>
                </div>
            </div>

            {/* Attributes */}
            <div className="flex flex-wrap gap-2 mb-4">
                 {firstCard?.color && (
                    <Tag color="cyan" className="m-0 text-xs font-medium">
                        {firstCard.color}
                    </Tag>
                 )}
                 {firstCard?.type && (
                    <Tag color="purple" className="m-0 text-xs font-medium">
                        {firstCard.type}
                    </Tag>
                 )}
            </div>

            {/* Details List */}
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <div className="flex justify-between">
                    <span>จำนวนการ์ด:</span>
                    <span className="font-medium text-black dark:text-white">{totalCards} ใบ</span>
                </div>
                <div className="flex justify-between">
                     <span>สถานะ:</span>
                     <span className="text-green-600 font-medium">Active</span>
                </div>
            </div>
          </div>

          {/* Bottom Action Lookalike */}
          <div className="mt-2 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
             <div className="text-right">
                <button className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                    Click to view details →
                </button>
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
