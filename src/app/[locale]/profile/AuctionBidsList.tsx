"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tag, Typography, Card, Empty, Skeleton, Collapse, Table } from "antd";
import {
  TrophyOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { getMyBids } from "@/services/auction";
import type { BidOrder } from "@/types/auction";
import { formatCurrency, formatDate } from "@/utils/format";
import { Link } from "@/navigation";

const { Text } = Typography;

function getWinStatus(bid: BidOrder): { label: string; color: string } {
  const ended =
    bid.product_status === "completed" ||
    bid.product_status === "closed" ||
    bid.product_status === "sold_out";

  if (bid.is_winning && ended) return { label: "ชนะประมูล!", color: "gold" };
  if (bid.is_winning && !ended) return { label: "กำลังชนะ", color: "processing" };
  if (!bid.is_winning && ended) return { label: "ไม่ชนะ", color: "default" };
  return { label: "เสนอราคาแล้ว", color: "blue" };
}

const productStatusLabel: Record<string, { color: "processing" | "success" | "warning" | "default" | "error"; label: string }> = {
  active: { color: "processing", label: "กำลังประมูล" },
  closed: { color: "warning", label: "สิ้นสุดแล้ว" },
  completed: { color: "success", label: "เสร็จสิ้น" },
  sold_out: { color: "success", label: "ขายแล้ว" },
};

// Group bids by product_id, keep only the latest winning bid per product for summary
function groupByProduct(bids: BidOrder[]): { productId: string; productName: string; bids: BidOrder[] }[] {
  const map = new Map<string, BidOrder[]>();
  for (const bid of bids) {
    const existing = map.get(bid.product_id) ?? [];
    existing.push(bid);
    map.set(bid.product_id, existing);
  }
  return Array.from(map.entries()).map(([productId, bids]) => ({
    productId,
    productName: bids[0].product_name || productId,
    bids,
  }));
}

export default function AuctionBidsList() {
  const { data: bids, isLoading } = useQuery<BidOrder[]>({
    queryKey: ["auction", "my-bids"],
    queryFn: getMyBids,
    select: (data) => data ?? [],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} size="small">
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (!bids || bids.length === 0) {
    return (
      <Empty
        description="คุณยังไม่มีประวัติการประมูล"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const groups = groupByProduct(bids);

  const bidHistoryColumns = [
    {
      title: "ราคา",
      dataIndex: "bid_amount",
      key: "bid_amount",
      render: (v: string) => (
        <Text strong className="text-sm">{formatCurrency(Number(v))}</Text>
      ),
    },
    {
      title: "ประเภท",
      key: "type",
      render: (_: unknown, record: BidOrder) => (
        <div className="flex gap-1 flex-wrap">
          {record.is_buy_now ? (
            <Tag color="purple" icon={<ThunderboltOutlined />}>ซื้อทันที</Tag>
          ) : (
            <Tag color="blue" icon={<RiseOutlined />}>เสนอราคา</Tag>
          )}
          {record.is_winning && (
            <Tag color="gold" icon={<TrophyOutlined />}>นำอยู่</Tag>
          )}
        </div>
      ),
    },
    {
      title: "เวลา",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => (
        <Text type="secondary" className="text-xs">{formatDate(v, true)}</Text>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {groups.map(({ productId, productName, bids: productBids }) => {
        // Summary bid: winning bid if exists, otherwise latest bid
        const winningBid = productBids.find((b) => b.is_winning) ?? productBids[0];
        const status = winningBid.product_status;
        const statusInfo = status ? productStatusLabel[status] : null;
        const winStatus = getWinStatus(winningBid);
        const highestBid = productBids.reduce(
          (max, b) => (Number(b.bid_amount) > Number(max.bid_amount) ? b : max),
          productBids[0]
        );

        const items = [
          {
            key: "history",
            label: (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <DownOutlined className="text-[10px]" />
                ประวัติการเสนอราคาทั้งหมด ({productBids.length} ครั้ง)
              </span>
            ),
            children: (
              <Table
                columns={bidHistoryColumns}
                dataSource={productBids}
                rowKey="bid_order_id"
                size="small"
                pagination={false}
                rowClassName={(r) => (r.is_winning ? "bg-yellow-50" : "")}
              />
            ),
          },
        ];

        return (
          <Card key={productId} size="small" className="hover:shadow-sm transition-shadow">
            {/* Summary row */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {winStatus.label === "ชนะประมูล!" && (
                    <TrophyOutlined className="text-yellow-500" />
                  )}
                  <Link
                    href={`/market/auction/${productId}`}
                    className="font-medium text-black hover:underline"
                  >
                    {productName}
                  </Link>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag color={winStatus.color as any}>{winStatus.label}</Tag>
                  {statusInfo && (
                    <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                  )}
                  {winningBid.is_buy_now && (
                    <Tag color="purple" icon={<ThunderboltOutlined />}>ซื้อทันที</Tag>
                  )}
                </div>
                <Text type="secondary" className="text-xs mt-1 block">
                  <ClockCircleOutlined className="mr-1" />
                  บิทล่าสุด: {formatDate(productBids[0].created_at, true)}
                </Text>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-base text-red-500">
                  {formatCurrency(Number(highestBid.bid_amount))}
                </div>
                <Text type="secondary" className="text-xs">ราคาสูงสุดของคุณ</Text>
              </div>
            </div>

            {/* Expandable bid history */}
            {productBids.length > 1 && (
              <Collapse
                ghost
                size="small"
                items={items}
                className="!border-0 !bg-transparent -mx-1"
              />
            )}
            {productBids.length === 1 && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <RiseOutlined />
                <span>1 ครั้ง</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
