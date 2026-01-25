import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Layout,
  Typography,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Card,
  Empty,
  ConfigProvider,
} from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { Link, usePathname, useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCart, removeFromCart, CartItem } from "@/services/cart";
import { getCardImageUrl } from "@/utils/image";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";

const { Header } = Layout;
const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backUrl,
}: PageHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const tNav = useTranslations("Navigation");
  const tCart = useTranslations("Cart");

  // Cart Logic
  const { data } = useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: isAuthenticated,
  });
  const cartItems = data || [];

  const removeMutation = useMutation({
    mutationFn: (id: number) => removeFromCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  useEffect(() => {
    if (searchParams.get("login") === "true") {
      setModalVisible(true);
    }
  }, [searchParams]);

  const menuItems: MenuProps["items"] = [
    {
      key: "/market",
      //icon: <ShoppingOutlined />,
      label: <Link href="/market">{tNav("market")}</Link>,
    },
    {
      key: "/cards",
      //icon: <AppstoreOutlined />,
      label: <Link href="/cards">{tNav("cards")}</Link>,
    },
    {
      key: "/products",
      //icon: <DatabaseOutlined />,
      label: <Link href="/products">{tNav("products")}</Link>,
    },
    {
      key: "/trading-market",
      //icon: <ShoppingOutlined />,
      label: <Link href="/trading-market">{tNav("tradingMarket")}</Link>,
    },
    {
      key: "/stock",
      //icon: <DatabaseOutlined />,
      label: <Link href="/stock">{tNav("stock")}</Link>,
    },
  ];

  if (user?.role?.name === "shop" || user?.role?.name === "admin") {
    menuItems.push({
      key: "/shop",
      //icon: <ShoppingOutlined />,
      label: <Link href="/shop">{tNav("shop")}</Link>,
    });
  }

  if (user?.role?.name === "admin") {
    menuItems.push({
      key: "/admin",
      icon: <AppstoreOutlined />,
      label: <Link href="/admin">{tNav("admin")}</Link>,
    });
  }

  const selectedKey = pathname.startsWith("/market")
    ? "/market"
    : pathname.startsWith("/products")
      ? "/products"
      : pathname.startsWith("/cards")
        ? "/cards"
        : pathname.startsWith("/stock")
          ? "/stock"
          : pathname.startsWith("/shop")
            ? "/shop"
            : "";

  const userMenu: MenuProps["items"] = [
    {
      key: "profile",
      label: <Link href="/profile">{tNav("profile")}</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: tNav("logout"),
      icon: <LogoutOutlined />,
      danger: true,
      onClick: async () => {
        await logout();
      },
    },
  ];

  const cartDropdownContent = (
    <Card
      className="w-[350px] shadow-2xl border border-blue-50 rounded-xl overflow-hidden"
      styles={{ body: { padding: 0 } }}
    >
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <Text strong className="text-gray-800">
          <ShoppingCartOutlined className="mr-2" /> {tCart("title")} (
          {cartItems.length})
        </Text>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="py-8 text-center bg-white">
            <Empty
              description={tCart("empty")}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white">
            {cartItems.map((item) => {
              const product = item.product;
              const price = Number(product?.price_period?.[0]?.price || 0);
              const firstCard =
                product?.product_stock_card?.[0]?.card ||
                product?.product_stock_card?.[0]?.stock_card?.cards;

              return (
                <div
                  key={item.cart_id}
                  className="p-3 flex gap-3 hover:bg-gray-50 group"
                >
                  <div className="relative w-12 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={getCardImageUrl(firstCard?.image_name)}
                      alt={product?.name || "Product"}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text
                      strong
                      className="block truncate text-sm"
                      title={product?.name}
                    >
                      {product?.name}
                    </Text>
                    <div className="flex justify-between items-center mt-1">
                      <Text type="secondary" className="text-xs">
                        x{item.quantity} · ฿{price.toLocaleString()}
                      </Text>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMutation.mutate(item.cart_id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t space-y-3">
        {cartItems.length > 0 && (
          <div className="flex justify-between items-center mb-1">
            <Text type="secondary">{tCart("total")}</Text>
            <Text strong className="text-lg text-blue-600">
              ฿
              {cartItems
                .reduce(
                  (acc, item) =>
                    acc +
                    Number(item.product?.price_period?.[0]?.price || 0) *
                      item.quantity,
                  0,
                )
                .toLocaleString()}
            </Text>
          </div>
        )}
        <Button type="primary" block onClick={() => router.push("/cart")}>
          {cartItems.length > 0 ? tCart("proceed") : tCart("goToMarket")}
        </Button>
      </div>
    </Card>
  );

  return (
    <Header className="sticky top-0 z-20 border-b px-4 h-auto py-0">
      <div className="container mx-auto max-w-7xl flex items-center justify-between h-16">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-6">
          {backUrl ? (
            <Link
              href={backUrl}
              className="flex items-center justify-center text-gray-600 hover:text-gray-900 mr-2"
            >
              <ArrowLeftOutlined style={{ fontSize: "20px" }} />
            </Link>
          ) : (
            <Link href="/" className="flex-shrink-0 -ml-3">
              <Image
                src="/images/icon/logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="hover:opacity-80 transition-opacity"
              />
            </Link>
          )}

          <div className="hidden md:block">
            <Title level={4} className="!mb-0 !text-gray-800">
              {title}
            </Title>
            {subtitle && (
              <Text type="secondary" className="text-xs">
                {subtitle}
              </Text>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 flex justify-center px-4">
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemHoverColor: "#DC143C",
                  horizontalItemSelectedColor: "#DC143C",
                  itemSelectedColor: "#DC143C",
                  activeBarHeight: 0,
                },
              },
            }}
          >
            <Menu
              mode="horizontal"
              selectedKeys={[selectedKey]}
              items={menuItems}
              className="border-0 !bg-transparent min-w-0 w-full justify-center [&_.ant-menu-item]:px-4"
            />
          </ConfigProvider>
        </div>

        {/* Auth / Actions */}
        <div className="flex items-center justify-end gap-2 md:gap-4 flex-shrink-0">
          <ThemeSwitcher />
          <LanguageSwitcher />
          {isAuthenticated ? (
            <div className="flex items-center gap-0 md:gap-2">
              <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  className="flex items-center px-1 md:px-4"
                >
                  <span className="hidden md:inline">{user?.username}</span>
                </Button>
              </Dropdown>

              <Dropdown
                popupRender={() => cartDropdownContent}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined style={{ fontSize: "20px" }} />}
                  className="flex items-center justify-center w-10 h-10 p-0 text-gray-600 hover:text-blue-600"
                />
              </Dropdown>
            </div>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => setModalVisible(true)}
            >
              {tNav("login")}
            </Button>
          )}
        </div>
      </div>

      <LoginModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </Header>
  );
}
