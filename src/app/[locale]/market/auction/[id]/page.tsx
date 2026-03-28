"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Button,
  InputNumber,
  Spin,
  Tag,
  Table,
  App,
  Divider,
  Card,
} from "antd";
import {
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getAuctionProduct, getBidHistory, placeBid, buyNow } from "@/services/auction";
import type { BidOrder } from "@/types/auction";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/utils/format";
import { getCardImageUrl } from "@/utils/image";
import PageHeader from "@/components/shared/PageHeader";
import Image from "next/image";
import { use } from "react";

const { Title, Text } = Typography;

interface WsBidEvent {
  type: "new_bid" | "auction_ended";
  payload: BidOrder;
}

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const { message: antMessage, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState<number | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["auction", "product", id],
    queryFn: () => getAuctionProduct(id),
  });

  const { data: bids = [] } = useQuery({
    queryKey: ["auction", "bids", id],
    queryFn: () => getBidHistory(id),
  });

  const highestBid = bids[0];
  const minBid = highestBid
    ? Number(highestBid.bid_amount) + 1
    : Number(product?.price || 0);

  useWebSocket(`/api/v1/ws/auction/${id}`, {
    enabled: isAuthenticated && !!id,
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data) as WsBidEvent;
        if (data.type === "new_bid" || data.type === "auction_ended") {
          queryClient.invalidateQueries({ queryKey: ["auction", "bids", id] });
          queryClient.invalidateQueries({ queryKey: ["auction", "product", id] });
        }
      } catch {
        // ignore
      }
    },
  });

  const bidMutation = useMutation({
    mutationFn: (amount: number) =>
      placeBid(id, { amount: String(amount) }),
    onSuccess: () => {
      antMessage.success("วางเดิมพันสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["auction", "bids", id] });
    },
    onError: (err: any) => {
      antMessage.error(err?.response?.data?.error || "วางเดิมพันไม่สำเร็จ");
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: () => buyNow(id),
    onSuccess: () => {
      antMessage.success("ซื้อทันทีสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["auction", "product", id] });
    },
    onError: (err: any) => {
      antMessage.error(err?.response?.data?.error || "ซื้อทันทีไม่สำเร็จ");
    },
  });

  const handleBid = () => {
    if (!isAuthenticated) {
      antMessage.warning("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    if (!bidAmount || bidAmount < minBid) {
      antMessage.error(`ราคาขั้นต่ำคือ ${formatCurrency(String(minBid))}`);
      return;
    }
    bidMutation.mutate(bidAmount);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      antMessage.warning("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    modal.confirm({
      title: "ยืนยันการซื้อทันที",
      content: `ยืนยันซื้อในราคา ${formatCurrency(product?.buy_now_price || product?.price || "0")}?`,
      onOk: () => buyNowMutation.mutate(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-8 text-center">ไม่พบสินค้า</div>;
  }

  const firstCard = product.product_stock_card?.[0];
  const imageName =
    firstCard?.card?.image_name || firstCard?.stock_card?.card?.image_name;

  const columns = [
    {
      title: "ผู้เสนอราคา",
      key: "user",
      render: (_: any, record: BidOrder) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          <Text>{record.user?.username || "ผู้ใช้"}</Text>
          {record.is_winning && <Tag color="gold">ชนะ</Tag>}
        </div>
      ),
    },
    {
      title: "ราคา",
      dataIndex: "bid_amount",
      key: "bid_amount",
      render: (v: string) => <Text strong>{formatCurrency(v)}</Text>,
    },
    {
      title: "เวลา",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => <Text type="secondary">{formatDate(v, true)}</Text>,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="รายละเอียดการประมูล" backUrl="/market/auction" />
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <div className="relative w-full aspect-[3/4] bg-gray-50 border border-gray-100">
              <Image
                src={getCardImageUrl(imageName, "original")}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
          </div>

          {/* Auction Info */}
          <div className="space-y-6">
            <div>
              <Tag color="red" icon={<FireOutlined />} className="mb-2">
                ประมูล
              </Tag>
              <Title level={2} className="!mb-1">
                {product.name}
              </Title>
              <Text type="secondary">{product.description}</Text>
            </div>

            <Card className="border border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary">ราคาเริ่มต้น</Text>
                  <Text strong>{formatCurrency(product.price)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">ราคาสูงสุดปัจจุบัน</Text>
                  <Text strong className="text-red-500 text-lg">
                    {highestBid
                      ? formatCurrency(highestBid.bid_amount)
                      : formatCurrency(product.price)}
                  </Text>
                </div>
                {product.buy_now_price && (
                  <div className="flex justify-between">
                    <Text type="secondary">ราคาซื้อทันที</Text>
                    <Text strong className="text-green-600">
                      {formatCurrency(product.buy_now_price)}
                    </Text>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <div>
                <Text className="block mb-1 text-sm font-medium">
                  ราคาเสนอของคุณ (ขั้นต่ำ {formatCurrency(String(minBid))})
                </Text>
                <InputNumber
                  className="w-full"
                  min={minBid}
                  step={1}
                  value={bidAmount}
                  onChange={(v) => setBidAmount(v)}
                  formatter={(v) => `฿ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => (v ? Number(v.replace(/฿\s?|(,*)/g, "")) : 0) as any}
                />
              </div>
              <Button
                type="primary"
                block
                size="large"
                icon={<ClockCircleOutlined />}
                onClick={handleBid}
                loading={bidMutation.isPending}
              >
                เสนอราคา
              </Button>
              {product.buy_now_price && (
                <Button
                  block
                  size="large"
                  icon={<ThunderboltOutlined />}
                  onClick={handleBuyNow}
                  loading={buyNowMutation.isPending}
                  className="border-green-500 text-green-600 hover:border-green-600"
                >
                  ซื้อทันที {formatCurrency(product.buy_now_price)}
                </Button>
              )}
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <Title level={4} className="mb-4">ประวัติการเสนอราคา</Title>
          <Table
            columns={columns}
            dataSource={bids}
            rowKey="bid_order_id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </div>
      </div>
    </div>
  );
}
