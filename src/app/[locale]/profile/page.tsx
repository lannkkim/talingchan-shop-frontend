"use client";

import React, { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Card,
  Avatar,
  Descriptions,
  Modal,
  ConfigProvider,
  Button
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/shared/PageHeader";
import { useRouter, useSearchParams } from "next/navigation";
import AddressList from "./AddressList";
import OrderList from "./OrderList";
import { useTranslations } from "next-intl";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

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
  },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  
  const [selectedKey, setSelectedKey] = useState(tab || "account");

  React.useEffect(() => {
    if (tab) {
      setSelectedKey(tab);
    }
  }, [tab]);
  
  const t = useTranslations("Profile");

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      Modal.confirm({
        title: t("logoutConfirm.title"),
        content: t("logoutConfirm.content"),
        okText: t("logoutConfirm.ok"),
        cancelText: t("logoutConfirm.cancel"),
        okType: "danger",
        onOk: async () => {
          await logout();
          router.push("/");
        },
      });
    } else {
      setSelectedKey(key);
    }
  };

  const menuItems = [
    {
      key: "account",
      icon: <UserOutlined />,
      label: t("menu.account"),
    },
    {
      key: "addresses",
      icon: <EnvironmentOutlined />,
      label: t("menu.addresses"),
    },
    {
      key: "purchases",
      icon: <ShoppingOutlined />,
      label: "คำสั่งซื้อของฉัน",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("menu.logout"),
      danger: true,
    },
  ];

  return (
    <ConfigProvider theme={bottegaTheme}>
      <Layout className="min-h-screen bg-white">
        <PageHeader title={t("title")} />

        <Layout className="has-sider">
          <Sider
            width={280}
            theme="light"
            className="border-r border-gray-100 !bg-white sticky top-0 h-[calc(100vh-64px)] overflow-y-auto"
            breakpoint="lg"
            collapsedWidth="0"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <Avatar
                  size={48}
                  icon={<UserOutlined />}
                  className="bg-black text-white"
                />
                <div className="flex-1 min-w-0">
                  <Text strong className="block truncate text-base">{user?.username || "User"}</Text>
                  <Text type="secondary" className="text-xs">Member</Text>
                </div>
              </div>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              items={menuItems}
              className="border-none px-2 py-4"
            />
          </Sider>

          <Content className="p-8 bg-white overflow-y-auto h-[calc(100vh-64px)]">
            <div className="max-w-4xl">
              {selectedKey === "account" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6">
                    <Title level={2} className="!mb-1">{t("account.title")}</Title>
                    <Text type="secondary">{t("account.description")}</Text>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-none">
                    <Title level={5} className="mb-4">{t("account.personalDetails")}</Title>
                    <div className="grid gap-6">
                      <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <Text type="secondary" className="col-span-1">{t("account.username")}</Text>
                        <Text strong className="col-span-2">{user?.username}</Text>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <Text type="secondary" className="col-span-1">{t("account.fullName")}</Text>
                        <Text className="col-span-2">{user?.first_name} {user?.last_name}</Text>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <Text type="secondary" className="col-span-1">{t("account.email")}</Text>
                        <Text className="col-span-2">{user?.email}</Text>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <Text type="secondary" className="col-span-1">{t("account.role")}</Text>
                        <Text className="col-span-2 capitalize">{user?.role?.name || "User"}</Text>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-6 border border-gray-100 rounded-none bg-white">
                    <SafetyOutlined className="text-black text-2xl mt-1" />
                    <div>
                      <Title level={5} className="!mb-1">
                        {t("account.security.title")}
                      </Title>
                      <Text type="secondary" className="block mb-4">
                        {t("account.security.description")}
                      </Text>
                      <Button disabled className="bg-gray-100 text-gray-400 border-none">Change Password</Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedKey === "addresses" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6">
                    <Title level={2} className="!mb-1">{t("menu.addresses")}</Title>
                    <Text type="secondary">Manage your shipping addresses</Text>
                  </div>
                  <AddressList />
                </div>
              )}

              {selectedKey === "purchases" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6">
                    <Title level={2} className="!mb-1">คำสั่งซื้อของฉัน</Title>
                    <Text type="secondary">ตรวจสอบสถานะและประวัติการสั่งซื้อของคุณ</Text>
                  </div>
                  <OrderList />
                </div>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
