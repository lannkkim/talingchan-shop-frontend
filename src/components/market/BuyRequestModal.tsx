"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Modal, Button, Tag, Typography, Row, Col, Divider, Space,
  Input, InputNumber, Empty, Spin, App, Badge
} from "antd";
import {
  LineChartOutlined, MessageOutlined, ShoppingOutlined, CheckOutlined, WarningOutlined
} from "@ant-design/icons";
import Link from "next/link";
import { Link as NavLink } from "@/navigation";
import { Product } from "@/types/product";
import { StockCard } from "@/types/stock";
import { getCardImageUrl } from "@/utils/image";
import { getMyInventory } from "@/services/stock";
import { submitBuyOrderOffer } from "@/services/trading";
import { getMyShop } from "@/services/shop";
import { getOrCreateThread } from "@/services/chat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface BuyRequestModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedStockItem {
  stockCardId: string;
  quantity: number;
  card?: StockCard["card"];
  maxQuantity: number;
}

export default function BuyRequestModal({ product, isOpen, onClose }: BuyRequestModalProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();

  const [offerOpen, setOfferOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedStockItem>>({});
  const [offerMessage, setOfferMessage] = useState("");

  const isBuyer = product?.users?.users_id === user?.users_id ||
    (product?.user_id && product.user_id === user?.users_id);

  // Fetch user's shop status (only when authenticated and not the buyer)
  const { data: myShop } = useQuery({
    queryKey: ["shop", "me"],
    queryFn: getMyShop,
    enabled: isAuthenticated && !isBuyer,
    retry: false,
  });

  const hasApprovedShop = myShop?.status === "approved";

  // Only fetch inventory when offer form is open
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ["inventory", "me"],
    queryFn: getMyInventory,
    enabled: offerOpen && isAuthenticated,
    select: (data) => data ?? [],
  });

  const contactMutation = useMutation({
    mutationFn: (userId: string) => getOrCreateThread({ participant_id: userId }),
    onSuccess: (thread) => {
      onClose();
      router.push(`/chat?thread=${thread.chat_thread_id}`);
    },
    onError: () => message.error("ไม่สามารถเปิดแชทได้"),
  });

  const offerMutation = useMutation({
    mutationFn: () =>
      submitBuyOrderOffer(product!.product_id, {
        items: Object.values(selectedItems).map((item) => ({
          stock_card_id: item.stockCardId,
          quantity: item.quantity,
        })),
        message: offerMessage || undefined,
      } as any),
    onSuccess: () => {
      message.success("ส่งข้อเสนอเรียบร้อยแล้ว ผู้ประกาศจะได้รับการแจ้งเตือน");
      queryClient.invalidateQueries({ queryKey: ["buy-order-offers", product?.product_id] });
      setOfferOpen(false);
      setSelectedItems({});
      setOfferMessage("");
      onClose();
    },
    onError: (err: any) => {
      const code = err?.response?.data?.code;
      const apiError = err?.response?.data?.error;
      if (code === "already_exists") {
        message.warning("คุณมีข้อเสนอที่รอการตอบรับอยู่แล้ว ไม่สามารถส่งซ้ำได้");
      } else {
        message.error(apiError || "ส่งข้อเสนอไม่สำเร็จ");
      }
    },
  });

  const handleToggleStock = (stockCard: StockCard) => {
    const id = stockCard.stock_card_id;
    if (selectedItems[id]) {
      const next = { ...selectedItems };
      delete next[id];
      setSelectedItems(next);
    } else {
      setSelectedItems({
        ...selectedItems,
        [id]: {
          stockCardId: id,
          quantity: 1,
          card: stockCard.card,
          maxQuantity: stockCard.quantity,
        },
      });
    }
  };

  const handleQuantityChange = (stockCardId: string, val: number) => {
    if (!selectedItems[stockCardId]) return;
    setSelectedItems({
      ...selectedItems,
      [stockCardId]: { ...selectedItems[stockCardId], quantity: val },
    });
  };

  const handleSubmitOffer = () => {
    if (Object.keys(selectedItems).length === 0) {
      message.warning("กรุณาเลือก stock card ที่ต้องการเสนอขายอย่างน้อย 1 รายการ");
      return;
    }
    modal.confirm({
      title: "ยืนยันการเสนอขาย",
      content: `คุณต้องการเสนอขาย ${Object.keys(selectedItems).length} รายการ ให้กับผู้ประกาศรับซื้อใช่ไหม?`,
      okText: "ยืนยัน",
      cancelText: "ยกเลิก",
      onOk: () => offerMutation.mutate(),
    });
  };

  if (!product) return null;

  const buyerName =
    product.users?.shop?.shop_profile?.shop_name ||
    product.users?.username ||
    "ผู้ใช้";
  const buyerInitial = buyerName.charAt(0).toUpperCase();
  const buyerUserId = product.user_id ?? product.users?.users_id;

  const wantedCards = product.product_stock_card ?? [];

  return (
    <>
      {/* Main Buy Request Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Tag color="orange" className="m-0 font-semibold">ประกาศรับซื้อ</Tag>
            <span>{product.name}</span>
          </div>
        }
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <div className="mt-4">
          <Row gutter={24}>
            {/* Left: Cards wanted */}
            <Col span={12} className="border-r border-gray-100">
              <Title level={5} className="mb-4">
                การ์ดที่ต้องการ ({wantedCards.reduce((s, pc) => s + pc.quantity, 0)} ใบ)
              </Title>
              <div className="max-h-[380px] overflow-y-auto pr-2 space-y-3">
                {wantedCards.map((pc) => {
                  const card = pc.stock_card?.card || pc.card;
                  return (
                    <div
                      key={pc.product_stock_card_id}
                      className="flex items-start gap-3 p-2 rounded-lg bg-orange-50/40 border border-orange-100"
                    >
                      <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={getCardImageUrl(card?.image_name, "thumb")}
                          alt={card?.name || "Card"}
                          fill
                          className="object-contain"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text strong className="block truncate" title={card?.name}>
                          {card?.name}
                        </Text>
                        <div className="flex items-center gap-2 mt-1">
                          {card?.rare && (
                            <Tag className="m-0 text-[10px]" color="gold">{card.rare}</Tag>
                          )}
                          <Text type="secondary" className="text-xs">{card?.type}</Text>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <Tag color="orange" className="mb-1">x{pc.quantity}</Tag>
                        <Link href={card?.card_id ? `/market/cards/${card.card_id}` : "#"}>
                          <Button type="link" size="small" className="p-0 h-auto text-[10px]" icon={<LineChartOutlined />}>
                            ข้อมูลตลาด
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Col>

            {/* Right: Price + Buyer + CTA */}
            <Col span={12}>
              <Title level={5} className="mb-4">รายละเอียด</Title>
              <Space orientation="vertical" size="middle" className="w-full">
                {product.description && (
                  <div>
                    <Text type="secondary" className="block text-xs">คำอธิบาย</Text>
                    <Text>{product.description}</Text>
                  </div>
                )}

                {/* Price block */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <Text type="secondary" className="text-xs block mb-1">ราคาที่ยินดีจ่าย</Text>
                  <Text strong className="text-2xl text-green-600">
                    ฿{Number(product.price).toLocaleString()}
                  </Text>
                  <Text type="secondary" className="block text-xs mt-1">
                    ต่อ {wantedCards.reduce((s, pc) => s + pc.quantity, 0)} ใบ
                  </Text>
                </div>

                <Divider className="my-2" />

                {/* Buyer info */}
                <div>
                  <Text type="secondary" className="block text-xs uppercase tracking-wider mb-3">
                    ผู้ประกาศรับซื้อ
                  </Text>
                  <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white"
                        style={{ backgroundColor: "#f97316" }}
                      >
                        {buyerInitial}
                      </div>
                      <div>
                        <Text strong className="block">{buyerName}</Text>
                        <Text type="secondary" className="text-xs">กำลังมองหาการ์ดเหล่านี้</Text>
                      </div>
                    </div>
                    {user && buyerUserId && user.users_id !== buyerUserId && (
                      <Button
                        size="small"
                        icon={<MessageOutlined />}
                        loading={contactMutation.isPending}
                        onClick={() => contactMutation.mutate(buyerUserId)}
                      >
                        แชท
                      </Button>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-2 space-y-2">
                  {!isAuthenticated ? (
                    <Button type="primary" size="large" className="w-full" disabled>
                      เข้าสู่ระบบเพื่อเสนอขาย
                    </Button>
                  ) : isBuyer ? (
                    <Button size="large" className="w-full" disabled>
                      ประกาศของคุณ
                    </Button>
                  ) : !hasApprovedShop ? (
                    <div className="space-y-2">
                      <Button size="large" className="w-full" disabled icon={<ShoppingOutlined />}>
                        เสนอขาย
                      </Button>
                      <div className="flex items-start gap-2 text-sm text-amber-700">
                        <WarningOutlined className="mt-0.5 flex-shrink-0" />
                        <span>
                          {!myShop
                            ? <><NavLink href="/shop" className="underline font-medium">สมัครเปิดร้านค้า</NavLink>{" "}ก่อนถึงจะเสนอขายได้</>
                            : "ร้านค้าของคุณยังรอการอนุมัติอยู่"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      className="w-full"
                      icon={<ShoppingOutlined />}
                      style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                      onClick={() => setOfferOpen(true)}
                    >
                      เสนอขาย
                    </Button>
                  )}
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      </Modal>

      {/* Offer Submission Sub-Modal */}
      <Modal
        title="เลือก stock card ที่ต้องการเสนอขาย"
        open={offerOpen}
        onCancel={() => {
          setOfferOpen(false);
          setSelectedItems({});
          setOfferMessage("");
        }}
        footer={
          <div className="flex justify-between items-center">
            <Text type="secondary" className="text-xs">
              เลือกแล้ว {Object.keys(selectedItems).length} รายการ
            </Text>
            <Space>
              <Button onClick={() => { setOfferOpen(false); setSelectedItems({}); setOfferMessage(""); }}>
                ยกเลิก
              </Button>
              <Button
                type="primary"
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                icon={<CheckOutlined />}
                loading={offerMutation.isPending}
                onClick={handleSubmitOffer}
              >
                ส่งข้อเสนอ
              </Button>
            </Space>
          </div>
        }
        width={640}
        destroyOnHidden
      >
        <div className="space-y-4">
          {/* Cards the buyer wants — reference */}
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
            <Text className="text-xs text-orange-700 font-medium block mb-1">การ์ดที่ผู้ซื้อต้องการ:</Text>
            <div className="flex flex-wrap gap-1">
              {wantedCards.map((pc) => {
                const card = pc.stock_card?.card || pc.card;
                return (
                  <Tag key={pc.product_stock_card_id} color="orange" className="m-0">
                    {card?.name} x{pc.quantity}
                  </Tag>
                );
              })}
            </div>
          </div>

          {/* Inventory list */}
          <div>
            <Text strong className="block mb-2">Stock ของคุณ</Text>
            {inventoryLoading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : inventory.length === 0 ? (
              <Empty description="ไม่มี stock card ในคลัง" className="py-6" />
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {inventory.map((stockCard: StockCard) => {
                  const isSelected = !!selectedItems[stockCard.stock_card_id];
                  return (
                    <div
                      key={stockCard.stock_card_id}
                      onClick={() => handleToggleStock(stockCard)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-green-400 bg-green-50"
                          : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative w-10 h-14 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={getCardImageUrl(stockCard.card?.image_name, "thumb")}
                          alt={stockCard.card?.name || ""}
                          fill
                          className="object-contain"
                          sizes="40px"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text strong className="block truncate text-sm">
                          {stockCard.card?.name || stockCard.stock_card_id}
                        </Text>
                        <div className="flex items-center gap-1 mt-0.5">
                          {stockCard.card?.rare && (
                            <Tag className="m-0 text-[10px]" color="gold">{stockCard.card.rare}</Tag>
                          )}
                          <Text type="secondary" className="text-xs">คงเหลือ {stockCard.quantity} ใบ</Text>
                        </div>
                      </div>
                      {isSelected && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <InputNumber
                            min={1}
                            max={selectedItems[stockCard.stock_card_id]?.maxQuantity}
                            value={selectedItems[stockCard.stock_card_id]?.quantity}
                            onChange={(val) =>
                              handleQuantityChange(stockCard.stock_card_id, Number(val) || 1)
                            }
                            size="small"
                            className="w-20"
                          />
                        </div>
                      )}
                      {isSelected && (
                        <CheckOutlined style={{ color: "#16a34a", fontSize: 18 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <Text className="block text-sm mb-1">ข้อความถึงผู้ซื้อ (optional)</Text>
            <TextArea
              rows={3}
              placeholder="เช่น: ฉันมีการ์ดที่คุณต้องการ สภาพ Near Mint ครับ"
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              maxLength={500}
              showCount
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
