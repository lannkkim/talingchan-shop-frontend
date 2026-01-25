"use client";

import { useState, useMemo } from "react";
import { Input, Card, Row, Col, Typography, Tag, Empty, Button, Spin } from "antd";
import { SearchOutlined, CheckCircleFilled } from "@ant-design/icons";
import Image from "next/image";
import { Product } from "@/types/product";
import { Card as CardType } from "@/types/card";
import { StockCard } from "@/types/stock";
import { getCardImageUrl } from "@/utils/image";
import { useTranslations } from "next-intl";

const { Text, Title } = Typography;
const { Search } = Input;

interface CardSelectionGridProps {
  products: (Product | CardType | StockCard)[];
  selectedProductId?: number;
  onSelect: (productId: number) => void;
  loading?: boolean;
  isCardMode?: boolean; // true = Card type, false = Product type
  isStockCardMode?: boolean; // true = StockCard type
}

export default function CardSelectionGrid({
  products,
  selectedProductId,
  onSelect,
  loading = false,
  isCardMode = false,
  isStockCardMode = false,
}: CardSelectionGridProps) {
  const t = useTranslations("TradingMarket");
  const [searchText, setSearchText] = useState("");
  const [displayCount, setDisplayCount] = useState(12); // แสดง 12 การ์ดแรก

  // Helper functions to handle Product, Card, and StockCard types
  const getItemId = (item: Product | CardType | StockCard) => {
    if (isStockCardMode) return (item as StockCard).stock_card_id;
    return isCardMode ? (item as CardType).card_id : (item as Product).product_id;
  };

  const getItemName = (item: Product | CardType | StockCard) => {
    if (isStockCardMode) {
      const stockCard = item as StockCard;
      return stockCard.cards?.name || "Unknown Card";
    }
    const itemWithName = item as Product | CardType;
    return itemWithName.name || "";
  };

  const getItemDescription = (item: Product | CardType | StockCard) => {
    if (isStockCardMode) {
      const stockCard = item as StockCard;
      return stockCard.cards?.main_effect || stockCard.cards?.favor_text || "";
    }
    if (isCardMode) {
      const card = item as CardType;
      return card.main_effect || card.favor_text || "";
    }
    return (item as Product).description || "";
  };

  const getItemType = (item: Product | CardType | StockCard) => {
    if (isStockCardMode) {
      return (item as StockCard).cards?.type || "";
    }
    if (isCardMode) {
      return (item as CardType).type || "";
    }
    return (item as Product).product_type?.name || "";
  };

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return products;

    const search = searchText.toLowerCase();
    return products.filter((item) => {
      const matchName = getItemName(item).toLowerCase().includes(search);
      const matchDescription = getItemDescription(item).toLowerCase().includes(search);
      const matchType = getItemType(item).toLowerCase().includes(search);
      
      if (isStockCardMode) {
        const stockCard = item as StockCard;
        const matchSymbol = stockCard.cards?.symbol?.toLowerCase().includes(search);
        const matchRare = stockCard.cards?.rare?.toLowerCase().includes(search);
        return matchName || matchDescription || matchType || matchSymbol || matchRare;
      } else if (isCardMode) {
        const card = item as CardType;
        const matchSymbol = card.symbol?.toLowerCase().includes(search);
        const matchRare = card.rare?.toLowerCase().includes(search);
        return matchName || matchDescription || matchType || matchSymbol || matchRare;
      } else {
        // Search in cards for Product type
        const product = item as Product;
        const matchCards = product.product_stock_card?.some((stockCard) => {
          const cardName = stockCard.card?.name?.toLowerCase() || 
                          stockCard.stock_card?.cards?.name?.toLowerCase() || "";
          return cardName.includes(search);
        });
        return matchName || matchDescription || matchType || matchCards;
      }
    });
  }, [products, searchText, isCardMode, isStockCardMode]);

  // Display limited products for pagination
  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  const getProductImage = (item: Product | CardType | StockCard) => {
    if (isStockCardMode) {
      const stockCard = item as StockCard;
      return getCardImageUrl(stockCard.cards?.image_name);
    }
    
    if (isCardMode) {
      const card = item as CardType;
      return getCardImageUrl(card.image_name);
    }
    
    const product = item as Product;
    const firstStock = product.product_stock_card?.[0];
    if (!firstStock) return "/images/card-placeholder.png";

    const imageName =
      firstStock.card?.image_name || firstStock.stock_card?.cards?.image_name;
    return getCardImageUrl(imageName);
  };

  const getCardCount = (item: Product | CardType | StockCard) => {
    if (isStockCardMode) {
      return (item as StockCard).quantity || 0;
    }
    if (isCardMode) {
      return 1; // Card แต่ละใบนับเป็น 1
    }
    const product = item as Product;
    return product.product_stock_card?.reduce((sum, pc) => sum + pc.quantity, 0) || 0;
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 12);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Search
        placeholder={t("modal.searchPlaceholder")}
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setDisplayCount(12); // Reset display count when searching
        }}
        size="large"
        allowClear
        className="mb-4"
      />

      {/* Results Count */}
      <div className="flex justify-between items-center mb-2">
        <Text type="secondary" className="text-sm">
          {t("modal.foundProducts", { count: filteredProducts.length })}
        </Text>
        {selectedProductId && (
          <Text className="text-sm text-blue-600">
            {t("modal.selected")}
          </Text>
        )}
      </div>

      {/* Cards Grid */}
      {displayedProducts.length > 0 ? (
        <>
          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <Row gutter={[12, 12]}>
              {displayedProducts.map((item) => {
                const itemId = getItemId(item);
                const isSelected = itemId === selectedProductId;
                const imageUrl = getProductImage(item);
                const cardCount = getCardCount(item);
                const itemName = getItemName(item);
                const itemType = getItemType(item);

                return (
                  <Col key={itemId} xs={12} sm={8} md={6}>
                    <Card
                      hoverable
                      onClick={() => onSelect(itemId)}
                      className={`relative overflow-hidden rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-blue-500 shadow-lg"
                          : "hover:shadow-md"
                      }`}
                      styles={{ body: { padding: "8px" } }}
                    >
                      {/* Selection Badge */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 z-10">
                          <CheckCircleFilled className="text-blue-500 text-2xl bg-white rounded-full" />
                        </div>
                      )}

                      {/* Card Image */}
                      <div className="relative w-full aspect-[2/3] bg-gray-100 rounded-md overflow-hidden mb-2">
                        <Image
                          src={imageUrl}
                          alt={itemName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>

                      {/* Card Info */}
                      <div className="space-y-1">
                        <Title
                          level={5}
                          className="!text-xs !font-semibold !mb-0 line-clamp-2"
                        >
                          {itemName}
                        </Title>

                        <div className="flex flex-wrap gap-1">
                          {itemType && (
                            <Tag className="text-[10px] px-1 py-0">
                              {itemType}
                            </Tag>
                          )}
                          {(isCardMode || isStockCardMode) && (
                            <>
                              {(() => {
                                const card = isStockCardMode 
                                  ? (item as StockCard).cards 
                                  : (item as CardType);
                                return (
                                  <>
                                    {card?.rare && (
                                      <Tag color="gold" className="text-[10px] px-1 py-0">
                                        {card.rare}
                                      </Tag>
                                    )}
                                    {card?.symbol && (
                                      <Tag color="blue" className="text-[10px] px-1 py-0">
                                        {card.symbol}
                                      </Tag>
                                    )}
                                  </>
                                );
                              })()}
                            </>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          {(!isCardMode || isStockCardMode) && (
                            <Text className="text-[10px] text-gray-600">
                              {t("card.quantity", { count: cardCount })}
                            </Text>
                          )}
                          <Text className="text-[10px] text-gray-500">
                            ID: {itemId}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                type="dashed"
                onClick={handleLoadMore}
                size="large"
                className="w-full max-w-md"
              >
                {t("modal.loadMore")} ({filteredProducts.length - displayCount}{" "}
                {t("modal.remaining")})
              </Button>
            </div>
          )}
        </>
      ) : (
        <Empty
          description={t("modal.noProductsFound")}
          className="py-12"
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
