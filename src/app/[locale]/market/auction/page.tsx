"use client";

import { useQuery } from "@tanstack/react-query";
import { Typography, Spin, Empty, Tag, Row, Col, Card } from "antd";
import { ClockCircleOutlined, FireOutlined } from "@ant-design/icons";
import { getAuctionProducts } from "@/services/auction";
import type { AuctionProduct } from "@/types/auction";
import { formatCurrency } from "@/utils/format";
import { Link } from "@/navigation";
import PageHeader from "@/components/shared/PageHeader";
import Image from "next/image";
import { getCardImageUrl } from "@/utils/image";

const { Title, Text } = Typography;

export default function AuctionListingPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["auction", "products"],
    queryFn: getAuctionProducts,
  });

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="ประมูลสินค้า" subtitle="ประมูลสินค้าการ์ดและของสะสม" />
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="mb-6 flex items-center gap-2">
          <FireOutlined className="text-red-500 text-xl" />
          <Title level={3} className="!mb-0">การประมูลที่เปิดอยู่</Title>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : products.length === 0 ? (
          <Empty description="ยังไม่มีการประมูลที่เปิดอยู่ในขณะนี้" className="py-20" />
        ) : (
          <Row gutter={[16, 16]}>
            {products.map((product: AuctionProduct) => {
              const firstCard = product.product_stock_card?.[0];
              const imageName =
                firstCard?.card?.image_name ||
                firstCard?.stock_card?.card?.image_name;

              return (
                <Col key={product.product_id} xs={24} sm={12} md={8} lg={6}>
                  <Link href={`/market/auction/${product.product_id}`}>
                    <Card
                      hoverable
                      className="border border-gray-100 transition-shadow hover:shadow-md"
                      styles={{ body: { padding: 0 } }}
                      cover={
                        <div className="relative w-full aspect-[3/4] bg-gray-50">
                          <Image
                            src={getCardImageUrl(imageName, "medium")}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 768px) 100vw, 25vw"
                            unoptimized
                          />
                          <div className="absolute top-2 left-2">
                            <Tag color="red" icon={<ClockCircleOutlined />}>
                              ประมูล
                            </Tag>
                          </div>
                        </div>
                      }
                    >
                      <div className="p-3">
                        <Text strong className="block truncate text-sm">
                          {product.name}
                        </Text>
                        <div className="mt-2 flex justify-between items-center">
                          <div>
                            <Text type="secondary" className="text-xs block">
                              ราคาเริ่มต้น
                            </Text>
                            <Text strong className="text-base">
                              {formatCurrency(product.price)}
                            </Text>
                          </div>
                          {product.highest_bid && (
                            <div className="text-right">
                              <Text type="secondary" className="text-xs block">
                                ราคาสูงสุด
                              </Text>
                              <Text strong className="text-base text-red-500">
                                {formatCurrency(product.highest_bid)}
                              </Text>
                            </div>
                          )}
                        </div>
                        {product.bidder_count !== undefined && (
                          <Text type="secondary" className="text-xs mt-1 block">
                            {product.bidder_count} คนเข้าร่วม
                          </Text>
                        )}
                      </div>
                    </Card>
                  </Link>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
}
