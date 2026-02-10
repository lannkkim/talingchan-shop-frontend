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
  message,
  Modal,
  App,
  ConfigProvider,
  Menu,
  Avatar,
  Badge
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
import { useState, useEffect } from "react";
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
  });

  // Derived state
  const selectedAddress = addresses.find(
    (a) => a.address_id === selectedAddressId,
  );

  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product.price || 0);
    return acc + price * item.quantity;
  }, 0);

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { modal } = App.useApp();
  const router = useRouter();

  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutInput) => checkout(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      modal.success({
        title: t("success"),
        content: t("successContent", { orderIds: data.order_ids.join(", ") }),
        onOk: () => {
          router.push("/profile?tab=purchases");
        },
      });
    },
    onError: (error: any) => {
      modal.error({
        title: t("error"),
        content: error.response?.data?.error || "ไม่สามารถทำรายการได้",
      });
    },
  });

  const handleCheckout = () => {
    if (!selectedAddressId) {
      message.error(t("selectShippingAddress"));
      return;
    }

    modal.confirm({
      title: t("confirmOrder"),
      content: t("confirmOrderContent", { amount: subtotal.toLocaleString() }),
      okText: t("confirm"),
      cancelText: t("cancel"),
      onOk: () => {
        checkoutMutation.mutate({
          shipping_address_id: selectedAddressId,
          payment_type_id: paymentMethod === "qr_promptpay" ? "1" : "1",
          cart_item_ids: [], // Checkout all items
        });
      },
    });
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

                      <div className="divide-y divide-gray-100">
                        {cartItems.map((item) => {
                          const product = item.product as Product;
                          const price = Number(product.price_period?.[0]?.price || 0);
                          const firstCard = product.product_stock_card?.[0]?.card || product.product_stock_card?.[0]?.stock_card?.card;

                          return (
                            <div key={item.cart_id} className="py-6 flex gap-6 group">
                              <div className="relative w-24 aspect-[3/4] bg-gray-50 border border-gray-200 flex-shrink-0">
                                <Image
                                  src={getCardImageUrl(firstCard?.image_name)}
                                  alt={product.name}
                                  fill
                                  className="object-cover p-2"
                                  sizes="96px"
                                />
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <Link href={`/market/cards/${btoa(String(firstCard?.card_id))}`}>
                                        <Text strong className="text-lg hover:underline cursor-pointer">{product.name}</Text>
                                      </Link>
                                      <Text type="secondary" className="block text-sm">{product.product_type?.name}</Text>
                                    </div>
                                    <Text strong className="text-lg">฿{(price * item.quantity).toLocaleString()}</Text>
                                  </div>
                                </div>

                                <div className="flex justify-between items-end">
                                  <div className="flex items-center gap-3">
                                    <div className="border border-gray-200 flex items-center">
                                      <Button
                                        type="text"
                                        size="small"
                                        className="px-2"
                                        onClick={() => item.quantity > 1 && updateQtyMutation.mutate({ id: item.cart_id, qty: item.quantity - 1 })}
                                      >-</Button>
                                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                      <Button
                                        type="text"
                                        size="small"
                                        className="px-2"
                                        onClick={() => updateQtyMutation.mutate({ id: item.cart_id, qty: item.quantity + 1 })}
                                      >+</Button>
                                    </div>
                                    <Button
                                      type="text"
                                      danger
                                      icon={<DeleteOutlined />}
                                      className="text-xs text-gray-400 hover:text-red-500"
                                      onClick={() => removeMutation.mutate(item.cart_id)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <Text type="secondary" className="text-xs">
                                    Unit Price: ฿{price.toLocaleString()}
                                  </Text>
                                </div>
                              </div>
                            </div>
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
                            <span className="text-green-600">Free</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                            <span className="font-medium text-lg uppercase">Total</span>
                            <span className="font-bold text-2xl">฿{subtotal.toLocaleString()}</span>
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
