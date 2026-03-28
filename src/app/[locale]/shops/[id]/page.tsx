"use client";

import { useQuery } from "@tanstack/react-query";
import { Typography, Tabs, Rate, Tag, Empty, Spin, Avatar } from "antd";
import { ShopOutlined, StarOutlined } from "@ant-design/icons";
import { getShopReviews } from "@/services/review";
import { getProductsByShop } from "@/services/shop";
import type { Review } from "@/types/review";
import { formatDate, formatCurrency } from "@/utils/format";
import { getCardImageUrl } from "@/utils/image";
import PageHeader from "@/components/shared/PageHeader";
import Image from "next/image";
import { Link } from "@/navigation";
import { use } from "react";

const { Title, Text } = Typography;

export default function PublicShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["shop", id, "products"],
    queryFn: () => getProductsByShop(id),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["shop", id, "reviews"],
    queryFn: () => getShopReviews(id),
    enabled: !!id,
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const tabs = [
    {
      key: "products",
      label: "สินค้า",
      children: (
        <div>
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : products.length === 0 ? (
            <Empty description="ยังไม่มีสินค้า" className="py-8" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product: any) => {
                const firstCard = product.product_stock_card?.[0];
                const imageName =
                  firstCard?.card?.image_name ||
                  firstCard?.stock_card?.card?.image_name;
                return (
                  <Link
                    key={product.product_id}
                    href={`/market/products/${product.product_id}`}
                  >
                    <div className="border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="relative aspect-[3/4] bg-gray-50">
                        <Image
                          src={getCardImageUrl(imageName, "medium")}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 50vw, 20vw"
                          unoptimized
                        />
                      </div>
                      <div className="p-2">
                        <Text className="text-xs truncate block">{product.name}</Text>
                        <Text strong className="text-sm">
                          {formatCurrency(product.price)}
                        </Text>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "reviews",
      label: `รีวิว (${reviews.length})`,
      children: (
        <div>
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : reviews.length === 0 ? (
            <Empty description="ยังไม่มีรีวิว" className="py-8" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50">
                <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
                <div>
                  <Rate disabled value={avgRating} />
                  <Text type="secondary" className="block text-sm">
                    {reviews.length} รีวิว
                  </Text>
                </div>
              </div>
              {reviews.map((review: Review) => (
                <div
                  key={review.review_id}
                  className="border border-gray-100 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar size={32} icon={<ShopOutlined />} className="bg-gray-200" />
                    <Text strong className="text-sm">
                      {review.reviewer?.username || "ผู้ใช้"}
                    </Text>
                    <Text type="secondary" className="text-xs ml-auto">
                      {formatDate(review.created_at)}
                    </Text>
                  </div>
                  <Rate disabled defaultValue={review.rating} className="text-sm" />
                  {review.comment && <Text className="block text-sm">{review.comment}</Text>}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="ร้านค้า" />
      <div className="container mx-auto max-w-6xl py-8 px-4">
        {/* Shop Header */}
        <div className="flex items-center gap-4 mb-8 p-6 border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white flex-shrink-0">
            <ShopOutlined className="text-2xl" />
          </div>
          <div>
            <Title level={3} className="!mb-1">
              ร้านค้า
            </Title>
            {avgRating > 0 && (
              <div className="flex items-center gap-2">
                <Rate disabled value={avgRating} className="text-sm" />
                <Text type="secondary" className="text-sm">
                  {avgRating.toFixed(1)} ({reviews.length} รีวิว)
                </Text>
              </div>
            )}
          </div>
        </div>

        <Tabs items={tabs} />
      </div>
    </div>
  );
}
