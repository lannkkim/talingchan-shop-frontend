"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { Typography, Row, Col, Card, Modal } from "antd";
import { useTranslations } from "next-intl";
import TradingProductCard from "./TradingProductCard";

const { Title, Text } = Typography;

interface SymbolGroupSectionProps {
  symbol: string;
  products: Product[];
}

export default function SymbolGroupSection({
  symbol,
  products,
}: SymbolGroupSectionProps) {
  const t = useTranslations("TradingMarket");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishModalOpen, setWishModalOpen] = useState(false);

  const handleViewWishList = (product: Product) => {
    setSelectedProduct(product);
    setWishModalOpen(true);
  };

  // Get symbol icon - you can customize this based on your data
  const getSymbolIcon = (sym: string) => {
    const iconMap: Record<string, string> = {
      "The Wagon": "👑",
      "Fire": "🔥",
      "Water": "💧",
      "Earth": "🌍",
      "Wind": "🌪️",
      "Other": "📦",
    };
    return iconMap[sym] || "🎴";
  };

  return (
    <>
      <Card
        className="w-full mb-8 rounded-xl shadow-sm border-gray-200"
        styles={{ body: { padding: "24px" } }}
      >
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-2 border border-gray-200 flex items-center justify-center">
            <div className="text-4xl">{getSymbolIcon(symbol)}</div>
          </div>
          <div className="flex-1">
            <Title level={4} className="mb-0 !font-bold text-gray-800">
              {symbol}
            </Title>
            <Text type="secondary" className="text-sm">
              {t("card.symbol")}
            </Text>
          </div>
          <div className="text-right">
            <Text type="secondary" className="text-xs block">
              {t("card.productCount")}
            </Text>
            <Text strong className="text-lg text-blue-600">
              {products.length}
            </Text>
          </div>
        </div>

        {/* Grid Section */}
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col key={product.product_id} xs={24} sm={24} md={12} lg={12} xl={12}>
              <TradingProductCard 
                product={product} 
                onViewWishList={handleViewWishList}
              />
            </Col>
          ))}
        </Row>
      </Card>

      {/* Wish List Modal */}
      <Modal
        title={`${t("modal.wishListTitle")} - ${selectedProduct?.name}`}
        open={wishModalOpen}
        onCancel={() => {
          setWishModalOpen(false);
          setSelectedProduct(null);
        }}
        footer={null}
        width={700}
      >
        <div className="py-4">
          <Text type="secondary">
            {t("modal.wishListDescription")}
          </Text>
          {/* TODO: Add wish list display here */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Text>{t("modal.wishListPlaceholder")}</Text>
          </div>
        </div>
      </Modal>
    </>
  );
}

