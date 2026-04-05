"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  checkout,
  CartItem,
  CheckoutInput,
} from "@/services/cart";
import { useRouter } from "next/navigation";
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
  Modal,
  App,
  ConfigProvider,
  Menu,
  Avatar,
  Badge,
  Tag
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  WalletOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  HeartOutlined,
  ShoppingOutlined
} from "@ant-design/icons";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import Image from "next/image";
import { getCardImageUrl } from "@/utils/image";
import { Product } from "@/types/product";
import { getAddresses } from "@/services/address";
import { Address } from "@/types/address";
import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

const { Title, Text } = Typography;
const { Content, Sider } = Layout;

const bottegaTheme = {
  token: {
    borderRadius: 0,
    colorPrimary: "#000000",
    fontFamily: "var(--font-inter)",
    colorText: "#000000",
    colorBgContainer: "#ffffff",
    colorBorder: "#e5e5e5",
  },
  components: {
    Button: {
      borderRadius: 0,
      controlHeight: 48,
      fontWeight: 500,
      primaryColor: "#ffffff",
      defaultBorderColor: "#000000",
      defaultColor: "#000000",
    },
    Input: {
      borderRadius: 0,
      controlHeight: 48,
      activeBorderColor: "#000000",
      hoverBorderColor: "#000000",
    },
    Layout: {
      bodyBg: "#ffffff",
      siderBg: "#ffffff",
    },
    Menu: {
      itemSelectedColor: "#000000",
      itemSelectedBg: "#f5f5f5",
      itemActiveBg: "#f5f5f5",
      itemHoverBg: "#fafafa",
      subMenuItemBg: "#ffffff",
    },
    Typography: {
      fontFamily: "var(--font-inter)",
    },
    InputNumber: {
      borderRadius: 0,
      activeBorderColor: "#000000",
      hoverBorderColor: "#000000",
    }
  },
};

export default function CartPage() {
  const queryClient = useQueryClient();
  const t = useTranslations("CartPage");
  const tCart = useTranslations("Cart");
  const [selectedKey, setSelectedKey] = useState("cart");

  // State
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("qr_promptpay");

  // Queries
  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });
  const cartItems = cartData || [];

  const { data: addressData } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
  });
  const addresses = addressData || [];

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
      message.success(t("removeSuccess"));
    },
    onError: () => {
      message.error("ไม่สามารถลบสินค้าออกจากตะกร้าได้ กรุณาลองใหม่");
    },
  });

  // Derived state
  const selectedAddress = addresses.find(
    (a) => a.address_id === selectedAddressId,
  );

  const groupedCartItems = useMemo(() => {
    const groups: Record<
      string,
      {
        shopName: string;
        isOfficial: boolean;
        items: CartItem[];
        shopImage?: string;
      }
    > = {};
    cartItems.forEach((item) => {
      const product = item.product;
      const user = product?.users;
      let shopId = "unknown";
      let shopName = "Unknown Shop";
      let isOfficial = false;

      if (product?.is_admin_shop) {
        shopId = "admin";
        shopName = "Talingchan Official";
        isOfficial = true;
      } else if (user) {
        shopId = user.users_id;
        shopName =
          user.shop?.shop_profile?.shop_name ||
          user.username ||
          "Community Member";
      }

      if (!groups[shopId]) {
        groups[shopId] = { shopName, isOfficial, items: [] };
      }
      groups[shopId].items.push(item);
    });
    return Object.values(groups);
  }, [cartItems]);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product.price || 0);
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = cartItems.reduce((acc, item) => {
    return acc + Number(item.product.shipping_fee || 0) * item.quantity;
  }, 0);

  const total = subtotal + shippingFee;

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { modal, message } = App.useApp();
  const router = useRouter();

  const handleCheckout = () => {
    if (!selectedAddressId) {
      message.error(t("selectShippingAddress"));
      return;
    }
    router.push(`/cart/pay?addressId=${selectedAddressId}`);
  };

  const menuItems = [
    {
      key: "cart",
      icon: <ShoppingOutlined />,
      label: (
        <div className="flex justify-between items-center w-full">
          <span>{t("myCart")}</span>
          <Badge count={cartItems.length} showZero size="small" color="#000" />
        </div>
      ),
    },
    {
      key: "saved",
      icon: <HeartOutlined />,
      label: "Saved Items",
      disabled: true,
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Purchase History",
      onClick: () => router.push("/profile?tab=purchases")
    }
  ];

  if (isLoading) {
    return (
      <Layout className="min-h-screen flex items-center justify-center bg-white">
        <Spin size="large" />
      </Layout>
    );
  }

  return (
    <ConfigProvider theme={bottegaTheme}>
      <Layout className="min-h-screen bg-white">
        <PageHeader title={tCart("title")} subtitle={t("subtitle")} />

        <Layout className="has-sider">
          <Sider
            width={280}
            theme="light"
            className="border-r border-gray-100 !bg-white sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto"
            breakpoint="lg"
            collapsedWidth="0"
          >
            <div className="p-6 border-b border-gray-100">
              <Title level={4} className="!mb-0">Shopping Bag</Title>
              <Text type="secondary">{cartItems.length} items</Text>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <Text type="secondary" className="block text-xs uppercase tracking-wider mb-1">Total Value</Text>
                <Title level={3} className="!mb-0">฿{subtotal.toLocaleString()}</Title>
              </div>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              items={menuItems}
              className="border-none px-2 py-4"
            />
          </Sider>

          <Content className="p-8 bg-white overflow-y-auto h-[calc(100vh-64px)]">
            <div className="max-w-6xl mx-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-20">
                  <Empty description={t("empty")} image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Link href="/market">
                      <Button type="primary" size="large" className="px-8">{t("goToMarketToShop")}</Button>
                    </Link>
                  </Empty>
                </div>
              ) : (
                <Row gutter={48}>
                  {/* Left Column: Cart Items List */}
                  <Col xs={24} lg={15}>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-6">
                        <Title level={3} className="!mb-0 font-light">Your Items</Title>
                        <Link href="/market">
                          <Button type="text" icon={<ArrowLeftOutlined />}>Continue Shopping</Button>
                        </Link>
                      </div>

                      <div className="space-y-6">
                        {groupedCartItems.map((group, groupIdx) => {
                          const groupSubtotal = group.items.reduce((acc, item) => acc + Number(item.product.price || 0) * item.quantity, 0);
                          const groupShipping = group.items.reduce((acc, item) => acc + Number(item.product.shipping_fee || 0) * item.quantity, 0);
                          const groupTotal = groupSubtotal + groupShipping;
                          const groupTotalQty = group.items.reduce((acc, item) => acc + item.quantity, 0);

                          return (
                            <Card key={groupIdx} styles={{ body: { padding: 0 } }} className="overflow-hidden border border-gray-200 shadow-sm rounded-xl">
                              {/* Shop Header */}
                              <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                                {group.isOfficial ? (
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm bg-blue-50 border border-blue-100">
                                    <Image src="/images/icon/logo.png" alt="Talingchan" width={32} height={32} className="rounded-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                                    {group.shopName.charAt(0)}
                                  </div>
                                )}
                                <Text strong className="text-sm uppercase tracking-wider">{group.shopName}</Text>
                                {group.isOfficial && <Tag color="blue" className="ml-2 border-0">Official</Tag>}
                              </div>

                              <div className="divide-y divide-gray-100 px-6">
                                {group.items.map((item) => {
                                  const product = item.product as Product;
                                  const price = Number(product.price || 0);
                                  const firstCard = product.product_stock_card?.[0]?.card || product.product_stock_card?.[0]?.stock_card?.card;
                                  const firstImage = firstCard?.image_name || product.product_stock_merch?.[0]?.stock_merch?.merch?.image_name;

                                  return (
                                    <div key={item.cart_id} className="py-6 flex gap-6 group">
                                      <div className="relative w-24 aspect-[3/4] bg-gray-50 border border-gray-200 flex-shrink-0">
                                        <Image
                                          src={getCardImageUrl(firstImage)}
                                          alt={product.name}
                                          fill
                                          className="object-cover p-2"
                                          sizes="96px"
                                          unoptimized
                                        />
                                      </div>

                                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div>
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <Link href={firstCard?.card_id ? `/market/cards/${firstCard.card_id}` : '#'}>
                                                <Text strong className="text-lg hover:underline cursor-pointer">{product.name}</Text>
                                              </Link>
                                              <Text type="secondary" className="block text-sm">{product.product_type?.name}</Text>
                                            </div>
                                            <Button
                                              type="text"
                                              danger
                                              icon={<DeleteOutlined className="text-red-300 group-hover:text-red-500 transition-colors" />}
                                              className="p-1 min-w-0 h-auto opacity-50 group-hover:opacity-100 bg-red-50 hover:bg-red-100 rounded-full w-8 flex items-center justify-center aspect-square"
                                              onClick={() => removeMutation.mutate(item.cart_id)}
                                            />
                                          </div>
                                        </div>

                                        <div className="flex justify-between items-end">
                                          <div className="flex gap-2 items-center">
                                            <InputNumber
                                              min={1}
                                              max={product.quantity || 1}
                                              value={item.quantity}
                                              onChange={(val) => {
                                                const qty = Number(val);
                                                if (qty && qty !== item.quantity) {
                                                  updateQtyMutation.mutate({ id: item.cart_id, qty });
                                                }
                                              }}
                                              size="small"
                                              className="w-20"
                                              disabled={updateQtyMutation.isPending}
                                            />
                                            {product.quantity != null && (
                                              <Text type="secondary" className="text-xs">/ {product.quantity} คงเหลือ</Text>
                                            )}
                                          </div>
                                          <Text strong className="text-lg text-gray-800">฿{(price * item.quantity).toLocaleString()}</Text>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Shop Footer / Summary */}
                              <div className="bg-gray-50 border-t border-gray-100 p-4 px-6">
                                <div className="space-y-2 mb-3">
                                  <div className="flex justify-between text-sm text-gray-600">
                                    <span>การจัดส่ง</span>
                                    <span className="font-medium text-gray-800">จัดส่งมาตรฐาน</span>
                                  </div>
                                  <div className="flex justify-between text-sm text-gray-600">
                                    <span>ค่าจัดส่ง</span>
                                    <span className={groupShipping === 0 ? "text-green-600 font-medium" : "text-gray-800 font-medium"}>
                                      {groupShipping === 0 ? "Free" : `฿${groupShipping.toLocaleString()}`}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                  <Text strong className="text-sm">รวมยอดสั่งซื้อ {groupTotalQty} ชิ้น</Text>
                                  <Text strong className="text-lg text-blue-600">฿{groupTotal.toLocaleString()}</Text>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </Col>

                  {/* Right Column: Summary */}
                  <Col xs={24} lg={9}>
                    <div className="bg-gray-50 p-8 sticky top-0 h-full min-h-[500px] flex flex-col">
                      <Title level={4} className="mb-6 uppercase tracking-wide">Order Summary</Title>

                      <div className="space-y-6 flex-1">
                        {/* Shipping Address */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Text strong className="uppercase text-xs tracking-wider text-gray-500">{t("shippingAddress")}</Text>
                            <Button type="link" size="small" className="p-0 h-auto text-black underline" onClick={() => setIsAddressModalOpen(true)}>
                              Change
                            </Button>
                          </div>
                          {selectedAddress ? (
                            <div className="text-sm text-gray-800">
                              <p className="font-medium mb-1">{selectedAddress.name}</p>
                              <p className="text-gray-600 leading-relaxed">
                                {selectedAddress.address} {selectedAddress.sub_district}<br />
                                {selectedAddress.district}, {selectedAddress.province} {selectedAddress.zipcode}
                              </p>
                              <p className="text-gray-500 mt-1">{selectedAddress.phone}</p>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic py-2">
                              {t("selectShippingAddress")}
                            </div>
                          )}
                        </div>

                        <Divider className="my-0" />

                        {/* Payment */}
                        <div>
                          <Text strong className="block mb-3 uppercase text-xs tracking-wider text-gray-500">{t("paymentMethod")}</Text>
                          <div
                            className={`p-3 border transition-all cursor-pointer flex items-center gap-3 ${paymentMethod === 'qr_promptpay' ? 'border-black bg-white' : 'border-gray-200'}`}
                            onClick={() => setPaymentMethod("qr_promptpay")}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'qr_promptpay' ? 'border-black' : 'border-gray-300'}`}>
                              {paymentMethod === 'qr_promptpay' && <div className="w-2 h-2 rounded-full bg-black" />}
                            </div>
                            <div className="flex-1">
                              <Text strong>QR PromptPay</Text>
                              <Text type="secondary" className="block text-xs">Scan to pay instantly</Text>
                            </div>
                          </div>
                        </div>

                        <Divider className="my-0" />

                        {/* Totals */}
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>฿{subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span className={shippingFee === 0 ? "text-green-600" : ""}>
                              {shippingFee === 0 ? "Free" : `฿${shippingFee.toLocaleString()}`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                            <span className="font-medium text-lg uppercase">Total</span>
                            <span className="font-bold text-2xl">฿{total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        block
                        className="mt-8 shadow-xl"
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0 || !selectedAddress}
                      >
                        CHECKOUT
                      </Button>
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          </Content>

          {/* Address Selection Modal - Styled to match */}
          <Modal
            title={<span className="text-lg font-medium">{t("selectAddress")}</span>}
            open={isAddressModalOpen}
            onCancel={() => setIsAddressModalOpen(false)}
            footer={null}
            centered
            width={500}
          >
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pt-4">
              {addresses.map((addr) => (
                <div
                  key={addr.address_id}
                  className={`p-4 border transition-all cursor-pointer group ${selectedAddressId === addr.address_id
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                    }`}
                  onClick={() => {
                    setSelectedAddressId(addr.address_id);
                    setIsAddressModalOpen(false);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Text strong className="text-base">{addr.name}</Text>
                        {addr.is_default && (
                          <span className="text-[10px] bg-black text-white px-1.5 py-0.5 uppercase tracking-wider">
                            {t("default")}
                          </span>
                        )}
                      </div>
                      <Text className="block text-sm text-gray-600 leading-relaxed">
                        {addr.address} {addr.sub_district} <br />
                        {addr.district} {addr.province} {addr.zipcode}
                      </Text>
                    </div>
                    {selectedAddressId === addr.address_id && (
                      <div className="text-black"><SafetyOutlined /></div>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/profile">
                  <Button block type="dashed" size="large">
                    {t("manageAddress")}
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
