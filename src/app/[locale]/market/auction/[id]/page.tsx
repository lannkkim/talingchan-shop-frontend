"use client";

import { useState, useEffect, useCallback } from "react";
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
  Avatar,
  Badge,
  Alert,
} from "antd";
import {
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  UserOutlined,
  ShopOutlined,
  RiseOutlined,
  TeamOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  getAuctionProduct,
  getAuctionState,
  getBidHistory,
  placeBid,
  buyNow,
} from "@/services/auction";
import { getAddresses } from "@/services/address";
import { Link } from "@/navigation";
import type { AuctionState, BidOrder } from "@/types/auction";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/utils/format";
import { getCardImageUrl } from "@/utils/image";
import PageHeader from "@/components/shared/PageHeader";
import Image from "next/image";
import { use } from "react";

const { Title, Text } = Typography;

// Countdown hook
function useCountdown(endAt: string | undefined) {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    if (!endAt) return;
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(endAt).getTime() - Date.now()) / 1000));
      setSeconds(diff);
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [endAt]);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const isEnded = seconds === 0 && !!endAt;
  const isUrgent = seconds > 0 && seconds <= 300; // last 5 min

  return { days, hours, minutes, secs, isEnded, isUrgent, totalSeconds: seconds };
}

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated, user } = useAuth();
  const { message: antMessage, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [extendedNotice, setExtendedNotice] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["auction", "product", id],
    queryFn: () => getAuctionProduct(id),
  });

  const { data: auctionState, refetch: refetchState } = useQuery({
    queryKey: ["auction", "state", id],
    queryFn: () => getAuctionState(id),
    refetchInterval: 10000, // poll every 10s for time sync
  });

  const { data: bids = [] } = useQuery({
    queryKey: ["auction", "bids", id],
    queryFn: () => getBidHistory(id),
    select: (data) => data ?? [],
  });

  const { data: myAddresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
    enabled: isAuthenticated,
    select: (data) => data ?? [],
  });
  const hasAddress = myAddresses.length > 0;

  // Use auctionState for live data, fall back to product fields
  const auctionEndAt = auctionState?.auction_end_at ?? product?.auction_end_at;
  const highestBidAmount = auctionState?.highest_bid ?? bids[0]?.bid_amount;
  const minBidIncrement = Number(auctionState?.min_bid_increment ?? product?.min_bid_increment ?? 10);
  const minBid = highestBidAmount
    ? Number(highestBidAmount) + minBidIncrement
    : Number(product?.start_price ?? product?.price ?? 0);
  const bidderCount = auctionState?.bidder_count ?? 0;

  const { days, hours, minutes, secs, isEnded, isUrgent } = useCountdown(auctionEndAt);

  const isOwner = !!user && !!product?.users && user.users_id === product.users.users_id;
  const isAuctionOver = isEnded || product?.status === "completed" || product?.status === "ended";

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["auction", "bids", id] });
    queryClient.invalidateQueries({ queryKey: ["auction", "state", id] });
    queryClient.invalidateQueries({ queryKey: ["auction", "product", id] });
  }, [queryClient, id]);

  useWebSocket(`/api/v1/ws/auction/${id}`, {
    enabled: isAuthenticated && !!id,
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data) as { type: string; data?: any };
        if (data.type === "new_bid") {
          invalidateAll();
        } else if (data.type === "auction_extended") {
          invalidateAll();
          const extMin = data.data?.extended_by_min;
          if (extMin) {
            setExtendedNotice(`เวลาถูกต่อเพิ่ม ${extMin} นาที`);
            setTimeout(() => setExtendedNotice(null), 8000);
          }
        } else if (data.type === "auction_ended") {
          invalidateAll();
        }
      } catch {
        // ignore
      }
    },
  });

  const bidMutation = useMutation({
    mutationFn: (amount: number) => placeBid(id, { amount: String(amount) }),
    onSuccess: () => {
      antMessage.success("เสนอราคาสำเร็จ");
      setBidAmount(null);
      invalidateAll();
    },
    onError: (err: any) => {
      antMessage.error(err?.response?.data?.error || "เสนอราคาไม่สำเร็จ");
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: () => buyNow(id),
    onSuccess: () => {
      antMessage.success("ซื้อทันทีสำเร็จ");
      invalidateAll();
    },
    onError: (err: any) => {
      antMessage.error(err?.response?.data?.error || "ซื้อทันทีไม่สำเร็จ");
    },
  });

  const handleBid = () => {
    if (!isAuthenticated) { antMessage.warning("กรุณาเข้าสู่ระบบก่อน"); return; }
    if (isOwner) { antMessage.error("ไม่สามารถเสนอราคาสินค้าของตัวเองได้"); return; }
    if (!bidAmount || bidAmount < minBid) {
      antMessage.error(`ราคาขั้นต่ำคือ ${formatCurrency(String(minBid))}`);
      return;
    }
    bidMutation.mutate(bidAmount);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { antMessage.warning("กรุณาเข้าสู่ระบบก่อน"); return; }
    if (isOwner) { antMessage.error("ไม่สามารถซื้อสินค้าของตัวเองได้"); return; }
    const price = product?.buy_now_price ?? product?.price;
    modal.confirm({
      title: "ยืนยันการซื้อทันที",
      content: `ยืนยันซื้อในราคา ${formatCurrency(String(price))}?`,
      okText: "ยืนยัน",
      cancelText: "ยกเลิก",
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

  const stockCards = product.product_stock_card ?? [];
  const firstCard = stockCards[0];
  const imageName = firstCard?.card?.image_name || firstCard?.stock_card?.card?.image_name;
  const shopName = product.users?.shop?.shop_profile?.shop_name ?? product.users?.username ?? "ผู้ขาย";

  const bidColumns = [
    {
      title: "ผู้เสนอราคา",
      key: "user",
      render: (_: any, record: BidOrder) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{record.user?.username ?? "ผู้ใช้"}</Text>
          {record.is_winning && <Tag color="gold">นำอยู่</Tag>}
          {record.is_buy_now && <Tag color="green">ซื้อทันที</Tag>}
        </div>
      ),
    },
    {
      title: "ราคา",
      dataIndex: "bid_amount",
      key: "bid_amount",
      render: (v: string) => <Text strong className="text-red-600">{formatCurrency(v)}</Text>,
    },
    {
      title: "เวลา",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => <Text type="secondary" className="text-xs">{formatDate(v, true)}</Text>,
    },
  ];

  // Format countdown display
  const countdownParts = [];
  if (days > 0) countdownParts.push(`${days} วัน`);
  if (hours > 0) countdownParts.push(`${String(hours).padStart(2, "0")} ชม.`);
  countdownParts.push(`${String(minutes).padStart(2, "0")} นาที`);
  countdownParts.push(`${String(secs).padStart(2, "0")} วินาที`);
  const countdownText = countdownParts.join(" ");

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="รายละเอียดการประมูล" backUrl="/market/auction" />

      {extendedNotice && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <Alert
            type="warning"
            icon={<ClockCircleOutlined />}
            showIcon
            title={`⏰ ${extendedNotice}`}
            banner
          />
        </div>
      )}

      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Image + card list */}
          <div className="space-y-4">
            <div className="relative w-full aspect-[3/4] bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
              <Image
                src={getCardImageUrl(imageName, "original")}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
              <div className="absolute top-3 left-3">
                <Tag color="red" icon={<FireOutlined />}>ประมูล</Tag>
              </div>
            </div>

            {/* All cards in this product — show for non-single types or multi-card lots */}
            {stockCards.length >= 1 &&
              (product.product_type?.code !== "single" ||
                stockCards.length > 1 ||
                stockCards.some((sc) => sc.quantity > 1)) && (
              <div>
                <Text strong className="block mb-2 text-sm">
                  การ์ดทั้งหมดในล็อตนี้ ({stockCards.reduce((sum, sc) => sum + sc.quantity, 0)} ใบ, {stockCards.length} แบบ)
                </Text>
                <div className="grid grid-cols-3 gap-2">
                  {stockCards.map((sc) => {
                    const card = sc.card ?? sc.stock_card?.card;
                    const img = getCardImageUrl(card?.image_name, "thumb");
                    return (
                      <div key={sc.product_stock_card_id} className="relative aspect-[3/4] bg-gray-50 rounded border border-gray-100 overflow-hidden">
                        <Image src={img} alt={card?.name ?? "card"} fill className="object-contain p-1" sizes="100px" unoptimized />
                        <div className="absolute top-1 right-1 bg-black text-white text-[9px] px-1 rounded-full font-bold">x{sc.quantity}</div>
                        {card?.name && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5 truncate px-0.5">{card.name}</div>
                        )}
                        {card?.rare && (
                          <div className="absolute top-1 left-1 bg-amber-500/80 text-white text-[8px] px-1 rounded-full">{card.rare}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Auction info + bidding */}
          <div className="space-y-5">
            {/* Title & seller */}
            <div>
              <Title level={2} className="!mb-1">{product.name}</Title>
              {product.description && (
                <Text type="secondary" className="block mb-3">{product.description}</Text>
              )}
              <div className="flex items-center gap-2">
                <ShopOutlined className="text-gray-400" />
                <Text type="secondary" className="text-sm">{shopName}</Text>
              </div>
            </div>

            {/* Countdown */}
            <Card
              className={`border-2 ${isEnded ? "border-gray-300 bg-gray-50" : isUrgent ? "border-red-400 bg-red-50" : "border-orange-300 bg-orange-50"}`}
              styles={{ body: { padding: "12px 16px" } }}
            >
              <div className="flex items-center gap-2 mb-1">
                <ClockCircleOutlined className={isUrgent ? "text-red-500" : "text-orange-500"} />
                <Text strong className={`text-sm ${isUrgent ? "text-red-600" : "text-orange-700"}`}>
                  {isEnded ? "การประมูลสิ้นสุดแล้ว" : isUrgent ? "ใกล้หมดเวลา!" : "เหลือเวลา"}
                </Text>
                {auctionState && auctionState.auto_extend_current_count > 0 && (
                  <Tag color="orange" className="ml-auto text-[10px]">
                    ต่อเวลาแล้ว {auctionState.auto_extend_current_count} ครั้ง
                  </Tag>
                )}
              </div>
              {!isEnded && (
                <Text className={`text-xl font-bold font-mono ${isUrgent ? "text-red-600" : "text-orange-800"}`}>
                  {countdownText}
                </Text>
              )}
              {auctionEndAt && (
                <Text type="secondary" className="block text-xs mt-1">
                  สิ้นสุด: {formatDate(auctionEndAt, true)}
                </Text>
              )}
              {product.auction_start_at && (
                <Text type="secondary" className="block text-xs">
                  เริ่ม: {formatDate(product.auction_start_at, true)}
                </Text>
              )}
            </Card>

            {/* Price info */}
            <Card className="border border-gray-100" styles={{ body: { padding: "12px 16px" } }}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Text type="secondary" className="text-sm">ราคาเริ่มต้น</Text>
                  <Text strong>{formatCurrency(String(product.start_price ?? product.price))}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text type="secondary" className="text-sm">ราคาสูงสุดปัจจุบัน</Text>
                  <Text strong className="text-red-500 text-lg">
                    {highestBidAmount ? formatCurrency(highestBidAmount) : <span className="text-gray-400 text-sm">ยังไม่มีการเสนอ</span>}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text type="secondary" className="text-sm">บิทขั้นต่ำ</Text>
                  <Text strong className="text-blue-600">{formatCurrency(String(minBidIncrement))}</Text>
                </div>
                {(auctionState?.buy_now_available || product.buy_now_price) && (
                  <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-1">
                    <Text type="secondary" className="text-sm">ราคาซื้อทันที</Text>
                    <Text strong className="text-green-600">
                      {formatCurrency(String(product.buy_now_price ?? "0"))}
                    </Text>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-1">
                  <div className="flex items-center gap-1">
                    <TeamOutlined className="text-gray-400" />
                    <Text type="secondary" className="text-sm">ผู้เข้าร่วม</Text>
                  </div>
                  <Text strong>{bidderCount} คน</Text>
                </div>
              </div>
            </Card>

            {/* Auto-extend info */}
            {product.auto_extend_trigger_min != null && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <InfoCircleOutlined className="text-blue-500 mt-0.5" />
                <div className="text-xs text-blue-700 space-y-0.5">
                  <div className="font-medium">Auto-Extend เปิดอยู่</div>
                  <div>หากมีบิทใน {product.auto_extend_trigger_min ?? 5} นาทีสุดท้าย เวลาจะเพิ่ม {product.auto_extend_duration_min ?? 5} นาที</div>
                  {product.auto_extend_max_count
                    ? <div>ต่อได้สูงสุด {product.auto_extend_max_count} ครั้ง (ต่อแล้ว {auctionState?.auto_extend_current_count ?? 0} ครั้ง)</div>
                    : <div>ไม่จำกัดจำนวนครั้ง</div>
                  }
                </div>
              </div>
            )}

            {/* Bidding action */}
            {!isAuctionOver && !isOwner && (
              <div className="space-y-3">
                {isAuthenticated && !hasAddress && (
                  <Alert
                    type="warning"
                    showIcon
                    message="กรุณาเพิ่มที่อยู่จัดส่งก่อน"
                    description={
                      <span>
                        คุณต้องมีที่อยู่จัดส่งอย่างน้อย 1 รายการก่อนจะเสนอราคาได้{" "}
                        <Link href="/profile?tab=addresses" className="underline font-medium">
                          เพิ่มที่อยู่
                        </Link>
                      </span>
                    }
                  />
                )}
                <div>
                  <Text className="block mb-1 text-sm font-medium">
                    ราคาเสนอของคุณ
                    <span className="text-gray-400 font-normal ml-1">
                      (ขั้นต่ำ {formatCurrency(String(minBid))})
                    </span>
                  </Text>
                  <InputNumber
                    className="w-full"
                    min={minBid}
                    step={minBidIncrement}
                    value={bidAmount}
                    onChange={(v) => setBidAmount(v)}
                    size="large"
                    disabled={isAuthenticated && !hasAddress}
                    formatter={(v) => `฿ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(v) => (v ? Number(v.replace(/฿\s?|(,*)/g, "")) : 0) as any}
                  />
                </div>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<RiseOutlined />}
                  onClick={handleBid}
                  loading={bidMutation.isPending}
                  disabled={!bidAmount || bidAmount < minBid || (isAuthenticated && !hasAddress)}
                  className="!bg-red-500 hover:!bg-red-600 !border-red-500"
                >
                  เสนอราคา {bidAmount && bidAmount >= minBid ? formatCurrency(String(bidAmount)) : ""}
                </Button>
                {(auctionState?.buy_now_available || product.buy_now_price) && (
                  <Button
                    block
                    size="large"
                    icon={<ThunderboltOutlined />}
                    onClick={handleBuyNow}
                    loading={buyNowMutation.isPending}
                    disabled={isAuthenticated && !hasAddress}
                    className="!border-green-500 !text-green-600 hover:!border-green-600 hover:!text-green-700"
                  >
                    ซื้อทันที {formatCurrency(String(product.buy_now_price ?? "0"))}
                  </Button>
                )}
              </div>
            )}

            {isOwner && (
              <Alert type="info" title="นี่คือสินค้าของคุณ — ไม่สามารถเสนอราคาได้" showIcon />
            )}

            {isAuctionOver && (
              <Alert
                type={bids.length > 0 ? "success" : "warning"}
                title={bids.length > 0 ? `การประมูลสิ้นสุด — ผู้ชนะ: ${bids.find(b => b.is_winning)?.user?.username ?? "-"}` : "การประมูลสิ้นสุดโดยไม่มีผู้เสนอราคา"}
                showIcon
              />
            )}
          </div>
        </div>

        <Divider />

        {/* Bid history */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Title level={4} className="!mb-0">ประวัติการเสนอราคา</Title>
            <Badge count={bids.length} color="red" />
          </div>
          {bids.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <RiseOutlined className="text-3xl mb-2" />
              <div>ยังไม่มีการเสนอราคา — เป็นคนแรก!</div>
            </div>
          ) : (
            <Table
              columns={bidColumns}
              dataSource={bids}
              rowKey="bid_order_id"
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              size="small"
              rowClassName={(record) => record.is_winning ? "bg-yellow-50" : ""}
            />
          )}
        </div>
      </div>
    </div>
  );
}
