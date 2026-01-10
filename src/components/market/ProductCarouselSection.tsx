"use client";

import { Card, Skeleton, Tag, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

const { Text } = Typography;

interface ProductCarouselSectionProps {
  products: Product[];
  isLoading: boolean;
  carouselRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  getProductImage: (product: Product) => string;
  getActivePrice: (product: Product) => number | null;
}

export default function ProductCarouselSection({
  products,
  isLoading,
  carouselRef,
  handleScroll,
  getProductImage,
  getActivePrice,
}: ProductCarouselSectionProps) {
  return (
    <div className="container mx-auto">
      <div className="relative">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="flex-shrink-0 w-[200px]">
                  <Skeleton.Image active className="!w-full !h-[250px]" />
                  <Skeleton active paragraph={{ rows: 2 }} className="mt-4" />
                </Card>
              ))
            : products && products.map((product, index) => (
                <Link
                  href={`/products/${product.product_id}`}
                  key={product.product_id}
                  className={
                    index === 0 ? "sticky left-0 z-10 block bg-white" : "block"
                  }
                >
                  <Card
                    hoverable
                    className="flex-shrink-0 w-[200px] overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                    cover={
                      <div className="relative h-[250px] bg-gray-100">
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                          sizes="200px"
                        />
                        {product.status === "active" && (
                          <Tag
                            color="red"
                            className="absolute bottom-2 left-2 m-0 font-bold"
                          >
                            NEW
                          </Tag>
                        )}
                        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded px-2 py-1">
                          <Text className="text-[10px] text-gray-600">
                            &quot;MORE THAN CARD&quot;
                          </Text>
                        </div>
                      </div>
                    }
                    styles={{ body: { padding: "12px" } }}
                  >
                    <Text className="text-sm text-gray-700 line-clamp-2 h-10">
                      {product.name}
                    </Text>
                    <div className="flex flex-col mt-2">
                      <div className="flex justify-between items-baseline">
                        {getActivePrice(product) && (
                          <Text strong className="text-blue-600">
                            ฿{getActivePrice(product)?.toLocaleString()}
                          </Text>
                        )}
                        {product.total_quantity !== undefined && (
                          <Text type="secondary" className="text-[10px] font-medium">
                            Qty: {product.total_quantity}
                          </Text>
                        )}
                      </div>
                      {product.market_min_price !== undefined && product.market_min_price > 0 && (
                        <Text type="secondary" className="text-[10px] leading-tight mt-0.5">
                          Market Starts at <span className="text-blue-500 font-medium">฿{product.market_min_price.toLocaleString()}</span>
                        </Text>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}
