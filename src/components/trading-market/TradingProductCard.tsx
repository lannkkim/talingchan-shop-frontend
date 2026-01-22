"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import { Card, Typography, Button, Tag } from "antd";
import { getCardImageUrl } from "@/utils/image";

const { Text, Title } = Typography;

interface TradingProductCardProps {
  product: Product;
}

export default function TradingProductCard({
  product,
}: TradingProductCardProps) {
  const getProductImage = () => {
    const firstStock = product.product_stock_card?.[0];
    if (!firstStock) return "/images/card-placeholder.png";

    const imageName =
      firstStock.card?.image_name || firstStock.stock_card?.cards?.image_name;
    return getCardImageUrl(imageName);
  };

  const imageUrl = getProductImage();
  const cardCount =
    product.product_stock_card?.reduce((sum, pc) => sum + pc.quantity, 0) || 0;

  return (
    <Card
      hoverable
      className="overflow-hidden rounded-xl border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
      styles={{ body: { padding: "16px" } }}
    >
      <div className="flex gap-4">
        {/* Left: Image */}
        <div className="relative w-[100px] h-[140px] flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="100px"
          />
        </div>

        {/* Right: Content */}
        <div className="flex flex-col flex-1 justify-between">
          <div>
            <Title level={4} className="mb-0 !text-xl !font-bold text-gray-800">
              {product.name}
            </Title>

            <div className="flex flex-wrap gap-1 mt-1 mb-2">
              {/* Mocking tags based on visual - logic might need adjustment */}
              <Text className="text-orange-500 text-xs">ชุด</Text>
              <Text className="text-gray-400 text-xs">sec</Text>
              <Text className="text-blue-600 text-xs">แลกเปลี่ยน</Text>
            </div>

            <div className="space-y-0.5">
              <Text className="block text-gray-600 text-xs">
                รายละเอียดสินค้า
              </Text>
              <Text className="block text-gray-800 text-sm font-medium">
                จำนวน {cardCount} ใบ
              </Text>
            </div>
          </div>

          <div className="mt-2">
            <Button
              shape="round"
              className="!text-gray-700 !border-gray-400 hover:!border-gray-600 hover:!text-gray-900 w-full max-w-[140px]"
            >
              ของที่ต้องการ
            </Button>
          </div>
        </div>
      </div>
      {/* Footer: Remaining - Absolute or Bottom of Flex? 
           Based on visual, 'เหลือ 1' is at bottom right or bottom left outside the main flex flow in a standard card, 
           but here it looks like it's part of the card body at the bottom.
       */}
      <div className="mt-3 flex justify-between items-end">
        <Text type="secondary" className="text-[10px]">
          เหลือ {product.quantity || 1}
        </Text>
      </div>
    </Card>
  );
}
