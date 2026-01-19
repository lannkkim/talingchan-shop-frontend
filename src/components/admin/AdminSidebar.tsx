"use client";

import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";

const { Sider } = Layout;

export default function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("Admin.Sidebar");

  // Determine selected key
  const getSelectedKey = () => {
    if (pathname.includes("/admin/users")) return "users";
    if (pathname.includes("/admin/roles")) return "roles";
    if (pathname.includes("/admin/products")) return "products";
    return "dashboard";
  };

  const items = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">{t("dashboard")}</Link>,
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: <Link href="/admin/users">{t("users")}</Link>,
    },
    {
      key: "roles",
      icon: <SafetyCertificateOutlined />,
      label: <Link href="/admin/roles">{t("roles")}</Link>,
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/products">{t("products")}</Link>,
    },
  ];

  return (
    <Sider
      width={250}
      theme="light"
      className="border-r border-gray-100 min-h-screen"
    >
      <div className="p-4 text-center border-b border-gray-100 mb-2">
        <h1 className="text-xl font-bold text-gray-800">{t("title")}</h1>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={items}
        className="border-0"
      />
    </Sider>
  );
}
