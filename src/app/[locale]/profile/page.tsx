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
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import AddressList from "./AddressList";
import { useTranslations } from "next-intl";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState("account");
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
      key: "logout",
      icon: <LogoutOutlined />,
      label: t("menu.logout"),
      danger: true,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <PageHeader title={t("title")} />

      <Content className="container mx-auto py-8 px-4">
        <Layout className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 max-w-5xl mx-auto min-h-[600px]">
          <Sider width={250} theme="light" className="border-r border-gray-100">
            <div className="p-6 text-center border-b border-gray-100">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                className="mb-4 bg-blue-50 text-blue-500"
              />
              <Title level={5} className="!mb-0">
                {user?.username || "User"}
              </Title>
              <Text type="secondary" className="text-xs">
                Member
              </Text>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              items={menuItems}
              className="border-0"
            />
          </Sider>

          <Content className="p-8 bg-white">
            {selectedKey === "account" && (
              <div className="max-w-2xl">
                <div className="mb-8">
                  <Title level={4}>{t("account.title")}</Title>
                  <Text type="secondary">{t("account.description")}</Text>
                </div>

                <Card className="border-gray-200">
                  <Descriptions
                    column={1}
                    size="middle"
                    title={t("account.personalDetails")}
                  >
                    <Descriptions.Item label={t("account.username")}>
                      <Text strong>{user?.username}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t("account.fullName")}>
                      {user?.first_name} {user?.last_name}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("account.email")}>
                      {user?.email}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("account.role")}>
                      <span className="capitalize">
                        {user?.role?.name || "User"}
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-4 items-start">
                  <SafetyOutlined className="text-blue-500 text-xl mt-1" />
                  <div>
                    <Title level={5} className="!mb-1 text-blue-700">
                      {t("account.security.title")}
                    </Title>
                    <Text type="secondary" className="text-blue-600">
                      {t("account.security.description")}
                    </Text>
                  </div>
                </div>
              </div>
            )}

            {selectedKey === "addresses" && <AddressList />}
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
}
