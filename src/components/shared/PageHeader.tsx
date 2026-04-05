import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Layout from "antd/es/layout";
import Typography from "antd/es/typography";
import Menu from "antd/es/menu";
import Button from "antd/es/button";
import Dropdown from "antd/es/dropdown";
import Badge from "antd/es/badge";
import Card from "antd/es/card";
import Empty from "antd/es/empty";
import ConfigProvider from "antd/es/config-provider";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  MessageOutlined,
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
import NotificationBell from "@/components/notification/NotificationBell";

const { Header } = Layout;
const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  onBack?: () => void;
}

export default function PageHeader({
  title,
  subtitle,
  backUrl,
  onBack,
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
    mutationFn: (id: string) => removeFromCart(id),
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
      label: (
        <Link href="/market">
          <span className="text-xs tracking-widest uppercase font-medium">{tNav("market")}</span>
        </Link>
      ),
    },
    {
      key: "/cards",
      label: (
        <Link href="/cards">
          <span className="text-xs tracking-widest uppercase font-medium">{tNav("cards")}</span>
        </Link>
      ),
    },
    {
      key: "/products",
      label: (
        <Link href="/products">
          <span className="text-xs tracking-widest uppercase font-medium">{tNav("products")}</span>
        </Link>
      ),
    },
    {
      key: "/stock",
      label: (
        <Link href="/stock">
          <span className="text-xs tracking-widest uppercase font-medium">{tNav("stock")}</span>
        </Link>
      ),
    },
  ];

  if (isAuthenticated) {
    menuItems.push({
      key: "/chat",
      label: (
        <Link href="/chat">
          <span className="text-xs tracking-widest uppercase font-medium">แชท</span>
        </Link>
      ),
    });
  }

  if (user?.role?.name === "shop" || user?.role?.name === "admin") {
    menuItems.push({
      key: "/shop",
      label: (
        <Link href="/shop">
          <span className="text-xs tracking-widest uppercase font-medium">{tNav("shop")}</span>
        </Link>
      ),
    });
  }

  if (user?.role?.name === "admin") {
    menuItems.push({
      key: "/admin",
      label: (
        <Link href="/admin">
          <span className="text-xs tracking-widest uppercase font-medium">{tNav("admin")}</span>
        </Link>
      ),
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
      className="w-[350px] shadow-2xl border border-gray-200 overflow-hidden"
      styles={{ body: { padding: 0 } }}
    >
      <div className="p-4 bg-white border-b flex justify-between items-center">
        <Text strong className="text-gray-800 text-xs tracking-widest uppercase">
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
              const price = Number(product?.price || 0);
              const firstImage =
                product?.product_stock_card?.[0]?.card?.image_name ||
                product?.product_stock_card?.[0]?.stock_card?.card
                  ?.image_name ||
                product?.product_stock_merch?.[0]?.stock_merch?.merch
                  ?.image_name;

              return (
                <div
                  key={item.cart_id}
                  className="p-3 flex gap-3 hover:bg-gray-50 group"
                >
                  <div className="relative w-12 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={getCardImageUrl(firstImage)}
                      alt={product?.name || "Product"}
                      fill
                      className="object-contain"
                      sizes="48px"
                      unoptimized
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
            <Text strong className="text-lg text-black">
              ฿
              {cartItems
                .reduce(
                  (acc, item) =>
                    acc + Number(item.product?.price || 0) * item.quantity,
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

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-20 transition-shadow duration-200 ${scrolled ? "shadow-md" : ""}`}>
      {/* Announcement Bar */}
      {/* <div className="announcement-bar">
        ยินดีต้อนรับสู่ตลาดซื้อ-ขายการ์ดออนไลน์ อันดับ 1 ของไทย
      </div> */}

      <Header className="border-b px-4 h-auto py-0">
        <div className="container mx-auto max-w-7xl flex items-center justify-between h-16">
          {/* Logo and Brand Section */}
          <div className="flex items-center gap-3">
            {onBack ? (
              <div
                onClick={onBack}
                className="flex items-center justify-center text-gray-600 hover:text-gray-900 mr-2 cursor-pointer"
              >
                <ArrowLeftOutlined style={{ fontSize: "20px" }} />
              </div>
            ) : backUrl ? (
              <Link
                href={backUrl}
                className="flex items-center justify-center text-gray-600 hover:text-gray-900 mr-2"
              >
                <ArrowLeftOutlined style={{ fontSize: "20px" }} />
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2 flex-shrink-0 -ml-2">
                <Image
                  src="/images/icon/logo.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="hover:opacity-80 transition-opacity"
                />
                <span className="hidden md:block text-base font-bold tracking-widest uppercase text-gray-900 dark:text-white">
                  TALINGCHAN
                </span>
              </Link>
            )}

            {(title !== "TALINGCHAN") && (
              <div className="hidden md:block border-l border-gray-200 pl-4">
                <Title level={5} className="!mb-0 !text-gray-800">
                  {title}
                </Title>
                {subtitle && (
                  <Text type="secondary" className="text-xs">
                    {subtitle}
                  </Text>
                )}
              </div>
            )}
          </div>

          {/* Navigation Menu — centered */}
          <div className="flex-1 flex justify-center px-4">
            <ConfigProvider
              theme={{
                components: {
                  Menu: {
                    itemHoverColor: "#DC143C",
                    horizontalItemSelectedColor: "#DC143C",
                    itemSelectedColor: "#DC143C",
                    activeBarHeight: 2,
                    activeBarBorderWidth: 2,
                  },
                },
              }}
            >
              <Menu
                mode="horizontal"
                selectedKeys={[selectedKey]}
                items={menuItems}
                className="border-0 !bg-transparent min-w-0 w-full justify-center [&_.ant-menu-item]:px-3"
              />
            </ConfigProvider>
          </div>

          {/* Auth / Actions */}
          <div className="flex items-center justify-end gap-1 md:gap-3 flex-shrink-0">
            <ThemeSwitcher />
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center gap-1 md:gap-3">
                <NotificationBell />

                <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                  <Button
                    type="text"
                    className="flex items-center gap-2 px-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(user?.username?.[0] ?? "U").toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{user?.username}</span>
                  </Button>
                </Dropdown>

                <Dropdown
                  popupRender={() => cartDropdownContent}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    className="flex items-center justify-center w-10 h-10 p-0 text-gray-700 hover:text-black"
                  >
                    <Badge count={cartItems.length} size="small" offset={[-2, 2]}>
                      <ShoppingCartOutlined style={{ fontSize: "18px" }} />
                    </Badge>
                  </Button>
                </Dropdown>
              </div>
            ) : (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                className="!bg-black !border-black hover:!bg-gray-800 !rounded-none"
                onClick={() => setModalVisible(true)}
              >
                {tNav("login")}
              </Button>
            )}
          </div>
        </div>
      </Header>

      <LoginModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
}
