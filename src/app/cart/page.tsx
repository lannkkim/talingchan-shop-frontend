"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  CartItem,
} from "@/services/cart";
import {
  Typography,
  Layout,
  Row,
  Col,
  Card,
  Button,
  InputNumber,
  Empty,
  Spin,
  Space,
  Divider,
  message,
  Modal,
  App,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  WalletOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import Image from "next/image";
import { getCardImageUrl } from "@/utils/image";
import { Product } from "@/types/product";
import { getAddresses } from "@/services/address";
import { Address } from "@/types/address";
import { useState, useEffect } from "react";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function CartPage() {
  const queryClient = useQueryClient();

  // Queries
  // State
  // State
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("qr_promptpay");

  // Queries
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
  });

  // Effects
  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const defaultAddr = addresses.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.address_id);
      } else if (addresses.length > 0) {
        setSelectedAddressId(addresses[0].address_id);
      }
    }
  }, [addresses, selectedAddressId]);

  // Mutations
  const updateQtyMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      updateCartQuantity(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFromCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      message.success("ลบสินค้าออกจากตะกร้าแล้ว");
    },
  });

  // Derived state
  const selectedAddress = addresses.find(
    (a) => a.address_id === selectedAddressId
  );

  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product.price_period?.[0]?.price || 0);
    return acc + price * item.quantity;
  }, 0);

  const totalCards = cartItems.reduce((acc, item) => {
    const cardsPerItem =
      item.product.product_stock_card?.reduce(
        (sum: number, psc: any) => sum + (psc.quantity || 0),
        0
      ) || 0;
    return acc + cardsPerItem * item.quantity;
  }, 0);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { modal } = App.useApp();

  const handleCheckout = () => {
    modal.info({
      title: "กําลังพัฒนาระบบชำระเงิน",
      content: "ระบบ Checkout จะเปิดให้ใช้งานเร็วๆ นี้ครับ!",
    });
  };

  if (isLoading) {
    return (
      <Layout className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <Text type="secondary">กำลังโหลดตะกร้าสินค้า...</Text>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <PageHeader title="ตะกร้าสินค้า" />
      <Content className="container mx-auto max-w-7xl py-8 px-4">
        <Row gutter={24}>
          {/* Left Column: Cart Items */}
          <Col xs={24} lg={16}>
            <Card className="shadow-sm rounded-xl overflow-hidden border-none mb-4">
              <div className="flex justify-between items-center mb-6">
                <Title level={4} className="m-0 flex items-center gap-2">
                  <ShoppingCartOutlined /> ตะกร้าของฉัน ({cartItems.length}{" "}
                  รายการ)
                </Title>
                <Link href="/market">
                  <Button type="link" icon={<ArrowLeftOutlined />}>
                    กลับไปตลาด
                  </Button>
                </Link>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-12 bg-white rounded-lg">
                  <Empty
                    description="ไม่มีสินค้าในตะกร้า"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Link href="/market">
                      <Button type="primary">ไปที่ตลาดเพื่อเลือกซื้อ</Button>
                    </Link>
                  </Empty>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const product = item.product as Product;
                    const price = Number(product.price_period?.[0]?.price || 0);
                    const firstCard =
                      product.product_stock_card?.[0]?.card ||
                      product.product_stock_card?.[0]?.stock_card?.card;

                    return (
                      <div
                        key={item.cart_id}
                        className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-all flex gap-4 items-center bg-white"
                      >
                        <div className="relative w-20 h-28 bg-gray-50 rounded flex-shrink-0">
                          <Image
                            src={getCardImageUrl(firstCard?.image_name)}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                            sizes="80px"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/market/cards/${btoa(
                              String(firstCard?.card_id)
                            )}`}
                          >
                            <Text
                              strong
                              className="text-lg block truncate hover:text-blue-600 transition-colors"
                            >
                              {product.name}
                            </Text>
                          </Link>
                          <Text
                            type="secondary"
                            className="text-xs italic block mb-2"
                          >
                            {product.product_type?.name}
                          </Text>
                          <div className="flex items-center gap-4">
                            <Text className="text-blue-600 font-bold text-base">
                              ฿{price.toLocaleString()}
                            </Text>
                            <div className="h-4 w-px bg-gray-200" />
                            <Space size="middle">
                              <InputNumber
                                min={1}
                                max={product.quantity || 99}
                                value={item.quantity}
                                onChange={(val) => {
                                  if (val)
                                    updateQtyMutation.mutate({
                                      id: item.cart_id,
                                      qty: val,
                                    });
                                }}
                                size="small"
                                className="w-16"
                              />
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                type="text"
                                onClick={() =>
                                  removeMutation.mutate(item.cart_id)
                                }
                              />
                            </Space>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 hidden md:block">
                          <Text type="secondary" className="text-xs block">
                            รวม
                          </Text>
                          <Text strong className="text-lg">
                            ฿{(price * item.quantity).toLocaleString()}
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </Col>

          {/* Right Column: Summary */}
          <Col xs={24} lg={8}>
            <Card className="shadow-sm rounded-xl border-none sticky">
              <Title level={4} className="mb-6">
                สรุปคำสั่งซื้อ
              </Title>

              <div className="space-y-6 mb-6">
                {/* Shipping Address Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>ที่อยู่จัดส่ง</Text>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setIsAddressModalOpen(true)}
                    >
                      เปลี่ยน
                    </Button>
                  </div>
                  {selectedAddress ? (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <Text strong className="block">
                        {selectedAddress.name}
                      </Text>
                      <Text type="secondary" className="text-xs block mb-1">
                        {selectedAddress.phone}
                      </Text>
                      <Text className="text-sm block text-gray-600 leading-snug">
                        {selectedAddress.address} {selectedAddress.sub_district}{" "}
                        {selectedAddress.district} {selectedAddress.province}{" "}
                        {selectedAddress.zipcode}
                      </Text>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                      <Text type="secondary">กรุณาเลือกที่อยู่จัดส่ง</Text>
                    </div>
                  )}
                </div>

                {/* Payment Method Section */}
                <div>
                  <Text strong className="block mb-2">
                    ช่องทางการชำระเงิน
                  </Text>
                  <div className="space-y-2">
                    <div
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                        paymentMethod === "qr_promptpay"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => setPaymentMethod("qr_promptpay")}
                    >
                      <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                        {paymentMethod === "qr_promptpay" && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Text strong>QR PromptPay</Text>
                        <Text type="secondary" className="text-xs block">
                          สแกนจ่ายรวดเร็ว ยืนยันทันที
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider className="my-2" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-gray-500">
                    <Text>ราคารวมสินค้า</Text>
                    <Text>฿{subtotal.toLocaleString()}</Text>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <Text>ค่าธรรมเนียม</Text>
                    <Text className="text-green-500">ฟรี</Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text strong className="text-lg uppercase">
                      ยอดชำระสุทธิ
                    </Text>
                    <Text strong className="text-2xl text-blue-600">
                      ฿{subtotal.toLocaleString()}
                    </Text>
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                className="h-12 text-lg rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700"
                icon={<WalletOutlined />}
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || !selectedAddress}
              >
                ชำระเงิน
              </Button>
            </Card>

            {/* Address Selection Modal */}
            <Modal
              title="เลือกที่อยู่จัดส่ง"
              open={isAddressModalOpen}
              onCancel={() => setIsAddressModalOpen(false)}
              footer={null}
            >
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {addresses.map((addr) => (
                  <div
                    key={addr.address_id}
                    className={`p-3 rounded-lg border cursor-pointer hover:border-blue-400 transition-all ${
                      selectedAddressId === addr.address_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => {
                      setSelectedAddressId(addr.address_id);
                      setIsAddressModalOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <Text strong>{addr.name}</Text>
                        {addr.is_default && (
                          <span className="ml-2 text-xs bg-gray-200 px-1 rounded text-gray-600">
                            ค่าเริ่มต้น
                          </span>
                        )}
                        <Text className="block text-sm text-gray-600 mt-1">
                          {addr.address} {addr.sub_district} {addr.district}{" "}
                          {addr.province} {addr.zipcode}
                        </Text>
                      </div>
                      {selectedAddressId === addr.address_id && (
                        <div className="text-blue-500">✓</div>
                      )}
                    </div>
                  </div>
                ))}
                <Link href="/profile">
                  <Button
                    block
                    type="dashed"
                    icon={<WalletOutlined />}
                    className="mt-2"
                  >
                    จัดการที่อยู่
                  </Button>
                </Link>
              </div>
            </Modal>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
