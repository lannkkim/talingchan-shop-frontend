"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import { Card, Typography, Button, Tag, Space } from "antd";
import { getCardImageUrl } from "@/utils/image";
import { SwapOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";

const { Text, Title } = Typography;

interface TradingProductCardProps {
  product: Product;
  onViewWishList?: (product: Product) => void;
}

export default function TradingProductCard({
  product,
  onViewWishList,
}: TradingProductCardProps) {
  const t = useTranslations("TradingMarket");
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

  // Get product type
  const productType = product.product_type?.name || "ไม่ระบุ";
  
  // Get transaction type
  const transactionType = product.transaction_type?.name || "แลกเปลี่ยน";

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
            <Title level={5} className="mb-1 !text-lg !font-bold text-gray-800 line-clamp-1">
              {product.name}
            </Title>

            <Space size={4} wrap className="mb-2">
              <Tag color="orange" className="text-xs">
                {productType}
              </Tag>
              <Tag color="blue" className="text-xs">
                {transactionType}
              </Tag>
              {product.users && (
                <Tag icon={<UserOutlined />} className="text-xs">
                  {product.users.username}
                </Tag>
              )}
            </Space>

            <div className="space-y-1">
              <Text className="block text-gray-600 text-xs">
                {t("card.productDetail")}
              </Text>
              <Text className="block text-gray-800 text-sm font-medium">
                {t("card.quantity", { count: cardCount })}
              </Text>
              {product.description && (
                <Text className="block text-gray-500 text-xs line-clamp-2">
                  {product.description}
                </Text>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Text type="secondary" className="text-xs">
              {t("card.remaining", { count: product.quantity || 1 })}
            </Text>
            
            <Button
              type="primary"
              size="small"
              icon={<SwapOutlined />}
              onClick={() => onViewWishList?.(product)}
              className="!rounded-full"
            >
              {t("actions.viewWishList")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

