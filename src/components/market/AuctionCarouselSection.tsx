"use client";

import { Card, Skeleton, Tag, Typography } from "antd";
import { ClockCircleOutlined, FireOutlined } from "@ant-design/icons";
import Image from "next/image";
import { Link } from "@/navigation";
import type { AuctionProduct } from "@/types/auction";
import { getCardImageUrl } from "@/utils/image";
import { formatCurrency } from "@/utils/format";

const { Title, Text } = Typography;

interface AuctionCarouselSectionProps {
  products: AuctionProduct[];
  isLoading: boolean;
  title?: string;
  viewAllLink?: string;
  showCoverCard?: boolean;
  showEmptyCard?: boolean;
}

export default function AuctionCarouselSection({
  products,
  isLoading,
  title = "ประมูลสินค้า",
  viewAllLink = "/market/auction",
  showCoverCard = true,
  showEmptyCard = true,
}: AuctionCarouselSectionProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-4 px-8">
        <div className="flex items-center gap-2">
          <FireOutlined className="text-red-500 text-lg" />
          <Title level={4} className="!mb-0 !text-xl">
            {title}
          </Title>
        </div>
        <Link
          href={viewAllLink}
          className="text-gray-500 hover:text-blue-600 transition-colors text-sm"
        >
          ดูเพิ่มเติม
        </Link>
      </div>

      <div className="flex gap-4 px-4">
        {/* Cover card — shown only on landing page */}
        {showCoverCard && (
          <Card
            className="flex-shrink-0 w-[200px] overflow-hidden shadow-lg bg-white"
            style={{ border: "1px solid #e5e7eb" }}
            cover={
              <div className="relative h-[320px]">
                <Image
                  src="/images/auction.png"
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            }
            styles={{ body: { display: "none" } }}
          />
        )}

        {/* Scrollable auction products */}
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide py-3 flex-grow"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px]">
                <Skeleton.Image active className="!w-full !h-[280px]" />
                <Skeleton active paragraph={{ rows: 2 }} className="mt-2" />
              </div>
            ))
          : products.length === 0 && showEmptyCard
          ? (
            <Link href={viewAllLink} className="flex-shrink-0">
              <div className="flex flex-col items-center justify-center w-[240px] h-[200px] rounded-xl border-2 border-dashed border-red-200 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer gap-3">
                <FireOutlined className="text-red-400 text-3xl" />
                <Text className="text-red-500 font-medium text-sm">ดูการประมูลทั้งหมด</Text>
              </div>
            </Link>
          )
          : products.length === 0
          ? <Text type="secondary">ไม่มีสินค้าในหมวดหมู่นี้</Text>
          : products.map((product) => {
              const firstCard = product.product_stock_card?.[0];
              const imageName =
                firstCard?.card?.image_name ||
                firstCard?.stock_card?.card?.image_name;

              return (
                <Link
                  key={product.product_id}
                  href={`/market/auction/${product.product_id}`}
                  className="flex-shrink-0 w-[200px]"
                >
                  <div className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-white">
                    <div className="relative w-full h-[280px] bg-gray-50">
                      <Image
                        src={getCardImageUrl(imageName, "medium")}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                        sizes="180px"
                        unoptimized
                      />
                      <div className="absolute top-2 left-2">
                        <Tag color="red" icon={<ClockCircleOutlined />} className="text-[10px] px-1.5">
                          ประมูล
                        </Tag>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <Text strong className="block truncate text-xs" title={product.name}>
                        {product.name}
                      </Text>
                      <div className="mt-1.5">
                        <Text type="secondary" className="text-[10px] block">ราคาเริ่มต้น</Text>
                        <Text strong className="text-sm text-gray-800">
                          {formatCurrency(product.price)}
                        </Text>
                      </div>
                      {product.highest_bid && (
                        <div className="mt-1">
                          <Text type="secondary" className="text-[10px] block">ราคาสูงสุด</Text>
                          <Text strong className="text-sm text-red-500">
                            {formatCurrency(product.highest_bid)}
                          </Text>
                        </div>
                      )}
                      {product.bidder_count !== undefined && product.bidder_count > 0 && (
                        <Text type="secondary" className="text-[10px] mt-1 block">
                          {product.bidder_count} คนเข้าร่วม
                        </Text>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
