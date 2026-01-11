"use client";

import React, { useState } from "react";
import { Layout, Typography, Menu, Button, Dropdown, Avatar } from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";

const { Header } = Layout;
const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
}

export default function PageHeader({ title, subtitle, backUrl }: PageHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    if (searchParams.get("login") === "true") {
      setModalVisible(true);
      // Optional: Clean URL
      // router.replace(pathname); 
    }
  }, [searchParams]);

  const menuItems = [
    {
      key: "/market",
      icon: <ShoppingOutlined />,
      label: <Link href="/market">Market</Link>,
    },
    {
      key: "/cards",
      icon: <AppstoreOutlined />,
      label: <Link href="/cards">Cards</Link>,
    },
    {
      key: "/products",
      icon: <DatabaseOutlined />, // Products icon was ShoppingOutlined, swapping to Database or keeping checks.
      // Wait, original products was ShoppingOutlined. I'll use ShopOutlined or similar for Market.
      // Let's use SkinOutlined or ShopOutlined if available.
      // Or reuse ShoppingOutlined for Market and something else for Products?
      // Products usually means management. Market means buying.
      // Let's keep Products as is and use a new icon for Market.
      // I'll import ShopOutlined.
      label: <Link href="/products">Products</Link>,
    },
    {
      key: "/stock",
      icon: <DatabaseOutlined />,
      label: <Link href="/stock">Stock</Link>,
    },
  ];

  // Add Admin Dashboard if user is admin
  if (user?.role?.name === "admin") {
      menuItems.push({
          key: "/admin",
          icon: <AppstoreOutlined />, // or DashboardOutlined
          label: <Link href="/admin">Admin</Link>,
      } as any);
  }

  // Determine selected key based on pathname
  const selectedKey = pathname.startsWith("/market") ? "/market" : pathname.startsWith("/products") ? "/products" : pathname.startsWith("/cards") ? "/cards" : pathname.startsWith("/stock") ? "/stock" : "";


  const userMenu: MenuProps['items'] = [
    {
      key: "profile",
      label: <Link href="/profile">Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: async () => {
         await logout();
         // Optionally redirect or refresh
      },
    },
  ];

  return (
    <Header className="sticky top-0 z-20 !bg-gray-50 border-b border-gray-200 px-4 md:px-8 h-auto py-0">
      <div className="container mx-auto flex items-center justify-between h-16">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-6">
          {backUrl ? (
             <Link href={backUrl} className="flex items-center justify-center text-gray-600 hover:text-gray-900 mr-2">
                 <ArrowLeftOutlined style={{ fontSize: '20px' }} />
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
              <Typography.Text type="secondary" className="text-xs">
                {subtitle}
              </Typography.Text>
            )}
          </div>
        </div>

        {/* Navigation Menu + Auth */}
        <div className="flex items-center flex-1 justify-end gap-4">
             <Menu
              mode="horizontal"
              selectedKeys={[selectedKey]}
              items={menuItems}
              className="border-0 !bg-gray-50 flex-1 justify-end min-w-0"
            />
            
            {isAuthenticated ? (
                <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                     <Button type="text" icon={<UserOutlined />} className="flex items-center">
                        <span className="hidden md:inline">{user?.username}</span>
                     </Button>
                </Dropdown>
            ) : (
                <Button type="primary" icon={<LoginOutlined />} onClick={() => setModalVisible(true)}>
                    Login
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
