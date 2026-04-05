"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { getProducts, getProduct } from "@/services/product";
import { useAuth } from "@/contexts/AuthContext";
import { App, Card, Divider, Input, InputNumber, Spin, Typography, Row, Col, Layout, Button, Empty, Tag, ConfigProvider, Modal, Skeleton, message as antMessage } from "antd";
import { PlusOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import PageHeader from "@/components/shared/PageHeader";
import { getCardImageUrl } from "@/utils/image";
import Image from "next/image";
import Link from "next/link";
import TradeProductCard from "@/components/market/TradeProductCard";
import { useRouter } from "next/navigation";
import { createOffer, getOffersForProduct, acceptOffer, rejectOffer } from "@/services/trading";
import { getMyInventory } from "@/services/stock";
import type { StockCard } from "@/types/stock";
import type { TradingOffer } from "@/types/trading";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function TradePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Query for Trade Products
  const { data: tradeProducts = [], isLoading } = useQuery({
    queryKey: ["products", "market", "trade", "all"],
    queryFn: () => getProducts({
      status: "active",
      is_admin_shop: false,
      transaction_type_code: "trade",
      include_shop: true,
      limit: 100, // Show more for dedicated page
    }),
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Offer Modal State ---
  const [offerProductId, setOfferProductId] = useState<string | null>(null);
  const [selectedStockItems, setSelectedStockItems] = useState<{ stock_card_id: string; quantity: number }[]>([]);
  const [offerCash, setOfferCash] = useState<string>("");
  const [offerMessage, setOfferMessage] = useState<string>("");

  const { data: myInventory = [] } = useQuery({
    queryKey: ["my-inventory"],
    queryFn: getMyInventory,
    enabled: !!offerProductId,
    select: (data) => data ?? [],
  });

  const { mutate: submitOffer, isPending: isSubmittingOffer } = useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      antMessage.success("ส่งข้อเสนอสำเร็จ");
      setOfferProductId(null);
      setSelectedStockItems([]);
      setOfferCash("");
      setOfferMessage("");
    },
    onError: () => antMessage.error("เกิดข้อผิดพลาด กรุณาลองใหม่"),
  });

  const handleToggleStockItem = (stock: StockCard) => {
    setSelectedStockItems(prev => {
      const exists = prev.find(i => i.stock_card_id === stock.stock_card_id);
      if (exists) return prev.filter(i => i.stock_card_id !== stock.stock_card_id);
      return [...prev, { stock_card_id: stock.stock_card_id, quantity: 1 }];
    });
  };

  const handleOfferQtyChange = (stockCardId: string, qty: number) => {
    setSelectedStockItems(prev =>
      prev.map(i => i.stock_card_id === stockCardId ? { ...i, quantity: qty } : i)
    );
  };

  const handleSubmitOffer = () => {
    if (!offerProductId || selectedStockItems.length === 0) return;
    submitOffer({
      target_product_id: offerProductId,
      items: selectedStockItems,
      additional_cash: offerCash || undefined,
      message: offerMessage || undefined,
    });
  };

  // Fetch full details when selected
  const { data: detailedProduct, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["product", selectedProduct?.product_id],
    queryFn: () => getProduct(selectedProduct!.product_id),
    enabled: !!selectedProduct,
  });

  // Use detailedProduct if available, otherwise selectedProduct (for immediate feedback)
  const activeProduct = detailedProduct || selectedProduct;

  const isOwner = !!user && !!activeProduct && user.users_id === activeProduct.user_id;

  const { data: receivedOffers = [], refetch: refetchOffers } = useQuery({
    queryKey: ["trading", "offers", selectedProduct?.product_id],
    queryFn: () => getOffersForProduct(selectedProduct!.product_id),
    enabled: !!selectedProduct && isOwner,
    select: (data) => data ?? [],
  });

  const queryClient = useQueryClient();

  const { mutate: doAccept, isPending: isAccepting } = useMutation({
    mutationFn: acceptOffer,
    onSuccess: (result) => {
      antMessage.success(result.order_id
        ? `ยอมรับข้อเสนอสำเร็จ สร้างออเดอร์ #${result.order_id.slice(0, 8)} แล้ว`
        : "ยอมรับข้อเสนอสำเร็จ"
      );
      refetchOffers();
      queryClient.invalidateQueries({ queryKey: ["products", "market", "trade"] });
    },
    onError: () => antMessage.error("เกิดข้อผิดพลาด"),
  });

  const { mutate: doReject, isPending: isRejecting } = useMutation({
    mutationFn: rejectOffer,
    onSuccess: () => {
      antMessage.success("ปฏิเสธข้อเสนอแล้ว");
      refetchOffers();
    },
    onError: () => antMessage.error("เกิดข้อผิดพลาด"),
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <Layout className="min-h-screen">
        <PageHeader title="ตลาดแลกเปลี่ยน (Trade Market)" backUrl="/market" />
        <Layout className="w-full">
          <Content className="container mx-auto max-w-7xl p-4 md:p-8">
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={2} className="!mb-0">รายการแลกเปลี่ยนทั้งหมด</Title>
                    <Text type="secondary">ค้นหาและแลกเปลี่ยนการ์ดที่คุณต้องการกับผู้เล่นคนอื่น</Text>
                </div>
                {user && (
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<PlusOutlined />} 
                        onClick={() => router.push("/market/trade/add")}
                    >
                        สร้างโพสต์แลกเปลี่ยน
                    </Button>
                )}
            </div>

            {tradeProducts.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {tradeProducts.map((p: Product) => (
                        <Col key={p.product_id} xs={24} lg={12} xl={12}>
                            <TradeProductCard product={p} onClick={handleProductClick} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty 
                    description="ยังไม่มีรายการแลกเปลี่ยนในขณะนี้" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    className="my-20"
                >
                    {user && (
                        <Button type="primary" onClick={() => router.push("/market/trade/add")}>
                            เริ่มสร้างรายการแรกเลย!
                        </Button>
                    )}
                </Empty>
            )}


            {/* Trade Detail Modal */}
            <Modal
                title={<span className="text-lg">รายละเอียดการแลกเปลี่ยน</span>}
                open={!!selectedProduct}
                onCancel={() => setSelectedProduct(null)}
                footer={null}
                width={isOwner ? 1200 : 1000}
                destroyOnHidden
            >
                {activeProduct && (
                    <Skeleton loading={isLoadingDetail} active>
                    <Row gutter={24} className="mt-4">
                        {/* Left Column: Offering (Have) */}
                        <Col span={10} className="border-r border-gray-100">
                            <Title level={5} type="secondary" className="mb-4">ผู้เสนอ (Offering)</Title>
                            
                            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50/50 rounded-lg">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {activeProduct.users?.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                    <Text strong className="block">{activeProduct.users?.username}</Text>
                                    <Text type="secondary" className="text-xs">Owner</Text>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {activeProduct.product_stock_card?.map(pc => {
                                    const card = pc.stock_card?.card || pc.card;
                                    return (
                                        <div key={pc.product_stock_card_id} className="flex gap-3 p-2 border rounded-lg hover:border-blue-200 transition-colors">
                                            <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                 <Image
                                                    src={getCardImageUrl(card?.image_name, "thumb")}
                                                    alt={card?.name || ""}
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <div>
                                                <Text strong className="block">{card?.name}</Text>
                                                <Tag color="gold" className="mt-1">{card?.rare}</Tag>
                                                <div className="mt-1">
                                                    <Tag>x{pc.quantity}</Tag>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Col>

                        {/* Right Column: Wants (Options) */}
                        <Col span={14}>
                            <Title level={5} type="secondary" className="mb-4">สิ่งที่ต้องการ (Looking For)</Title>
                            <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6">
                                {activeProduct.trade_wants?.map((pkg, idx) => (
                                    <div key={pkg.package_id} className="p-4 border rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <Tag color="cyan" className="text-sm px-2 py-0.5 m-0">Option {idx + 1}</Tag>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {pkg.products?.map(prod => (
                                                <div key={prod.product_id}>
                                                    {prod.product_stock_card?.map(pc => {
                                                        const card = pc.stock_card?.card || pc.card;
                                                        return (
                                                            <div key={pc.product_stock_card_id} className="flex gap-3 items-center bg-white p-2 rounded border">
                                                                 <div className="relative w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                                    <Image
                                                                        src={getCardImageUrl(card?.image_name, "thumb")}
                                                                        alt={card?.name || ""}
                                                                        fill
                                                                        className="object-contain"
                                                                        unoptimized
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Text className="text-sm block">{card?.name}</Text>
                                                                    <div className="flex gap-1 mt-0.5">
                                                                        <Tag className="text-[10px] m-0">{card?.rare}</Tag>
                                                                        <Tag color="blue" className="text-[10px] m-0">x{pc.quantity}</Tag>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 text-right">
                                            {user && user.users_id !== activeProduct.user_id && (
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    ghost
                                                    onClick={() => {
                                                        setSelectedProduct(null);
                                                        setOfferProductId(activeProduct!.product_id);
                                                    }}
                                                >
                                                    เสนอแลกเปลี่ยน
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!activeProduct.trade_wants || activeProduct.trade_wants.length === 0) && (
                                    <Empty description="ไม่มีข้อมูลสิ่งที่ต้องการ" />
                                )}
                            </div>
                        </Col>
                    </Row>
                    {/* Received Offers — visible to owner only */}
                    {isOwner && (
                      <div className="mt-6 border-t pt-4">
                        <Title level={5} className="mb-3">
                          ข้อเสนอที่ได้รับ
                          {receivedOffers.length > 0 && (
                            <Tag color="blue" className="ml-2">{receivedOffers.length}</Tag>
                          )}
                        </Title>
                        {receivedOffers.length === 0 ? (
                          <Empty description="ยังไม่มีข้อเสนอ" image={Empty.PRESENTED_IMAGE_SIMPLE} className="py-4" />
                        ) : (
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {receivedOffers.map((offer: TradingOffer) => (
                              <div key={offer.offer_id} className="border rounded-lg p-3 bg-gray-50 hover:bg-white transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Text strong className="text-sm">{offer.offerer_name ?? offer.offerer_id}</Text>
                                      <Tag color={
                                        offer.status === "PENDING" ? "orange" :
                                        offer.status === "ACCEPTED" ? "success" :
                                        offer.status === "REJECTED" ? "error" : "default"
                                      } className="m-0 text-xs">
                                        {offer.status === "PENDING" ? "รอการตอบรับ" :
                                         offer.status === "ACCEPTED" ? "ยอมรับแล้ว" :
                                         offer.status === "REJECTED" ? "ปฏิเสธแล้ว" : offer.status}
                                      </Tag>
                                    </div>
                                    <Text type="secondary" className="text-xs block">
                                      เสนอ {offer.items.length} รายการ
                                      {offer.additional_cash && ` + ฿${Number(offer.additional_cash).toLocaleString()}`}
                                    </Text>
                                    {offer.message && (
                                      <Text type="secondary" className="text-xs italic block mt-0.5">"{offer.message}"</Text>
                                    )}
                                  </div>
                                  {offer.status === "PENDING" && (
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        size="small"
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        loading={isAccepting}
                                        onClick={() => doAccept(offer.offer_id)}
                                      >
                                        ยอมรับ
                                      </Button>
                                      <Button
                                        size="small"
                                        danger
                                        icon={<CloseOutlined />}
                                        loading={isRejecting}
                                        onClick={() => doReject(offer.offer_id)}
                                      >
                                        ปฏิเสธ
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    </Skeleton>
                )}
            </Modal>
          </Content>
        </Layout>
      </Layout>

      {/* Submit Offer Modal */}
      <Modal
        title="ส่งข้อเสนอแลกเปลี่ยน"
        open={!!offerProductId}
        onCancel={() => setOfferProductId(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOfferProductId(null)}>ยกเลิก</Button>
            <Button
              type="primary"
              disabled={selectedStockItems.length === 0}
              loading={isSubmittingOffer}
              onClick={handleSubmitOffer}
            >
              ส่งข้อเสนอ ({selectedStockItems.length} รายการ)
            </Button>
          </div>
        }
        width={680}
        destroyOnHidden
      >
        <div className="space-y-4 py-2">
          <Text type="secondary" className="text-sm block">เลือกการ์ดจากคลังของคุณที่ต้องการเสนอ</Text>

          {myInventory.length === 0 ? (
            <Empty
              description="ไม่มีการ์ดในคลัง"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Link href="/stock">
                <Button size="small">เพิ่มการ์ดในคลัง</Button>
              </Link>
            </Empty>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {myInventory.map((stock: StockCard) => {
                const selected = selectedStockItems.find(i => i.stock_card_id === stock.stock_card_id);
                return (
                  <div
                    key={stock.stock_card_id}
                    className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400"}`}
                    onClick={() => handleToggleStockItem(stock)}
                  >
                    <div className="relative w-full aspect-[3/4] mb-1 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={getCardImageUrl(stock.card?.image_name, "thumb")}
                        alt={stock.card?.name || ""}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <Text className="text-[11px] block truncate font-medium">{stock.card?.name}</Text>
                    <Text type="secondary" className="text-[10px]">มี {stock.quantity} ใบ</Text>
                    {selected && (
                      <div className="mt-1" onClick={e => e.stopPropagation()}>
                        <InputNumber
                          size="small"
                          min={1}
                          max={stock.quantity}
                          value={selected.quantity}
                          onChange={v => v && handleOfferQtyChange(stock.stock_card_id, v)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Divider className="my-3" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Text className="text-sm mb-1 block">เพิ่มเงินสด (บาท)</Text>
              <InputNumber
                className="w-full"
                min={0}
                placeholder="0"
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={v => v?.replace(/,/g, "") as unknown as number}
                value={offerCash ? Number(offerCash) : undefined}
                onChange={v => setOfferCash(v ? String(v) : "")}
              />
            </div>
            <div>
              <Text className="text-sm mb-1 block">ข้อความถึงเจ้าของ</Text>
              <Input.TextArea
                rows={2}
                placeholder="ระบุข้อความเพิ่มเติม..."
                value={offerMessage}
                onChange={e => setOfferMessage(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
}
