"use client";

import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  ShopOutlined,
  BankOutlined,
  PercentageOutlined,
  AuditOutlined,
  ExclamationCircleOutlined,
  GiftOutlined,
  RobotOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  AppstoreOutlined,
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
    if (pathname.includes("/admin/orders")) return "orders";
    if (pathname.includes("/admin/shops")) return "shops";
    if (pathname.includes("/admin/payouts")) return "payouts";
    if (pathname.includes("/admin/fee-rules")) return "fee-rules";
    if (pathname.includes("/admin/ledger")) return "ledger";
    if (pathname.includes("/admin/audit-log")) return "audit-log";
    if (pathname.includes("/admin/disputes")) return "disputes";
    if (pathname.includes("/admin/mystery-boxes")) return "mystery-boxes";
    if (pathname.includes("/admin/bots")) return "bots";
    if (pathname.includes("/admin/cards")) return "cards";
    if (pathname.includes("/admin/merch")) return "merch";
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
      key: "orders",
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/orders">{t("orders")}</Link>,
    },
    {
      key: "shops",
      icon: <ShopOutlined />,
      label: <Link href="/admin/shops">Shops</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "payouts",
      icon: <BankOutlined />,
      label: <Link href="/admin/payouts">ถอนเงิน</Link>,
    },
    {
      key: "fee-rules",
      icon: <PercentageOutlined />,
      label: <Link href="/admin/fee-rules">กฎค่าธรรมเนียม</Link>,
    },
    {
      key: "ledger",
      icon: <FileTextOutlined />,
      label: <Link href="/admin/ledger">Ledger</Link>,
    },
    {
      key: "disputes",
      icon: <ExclamationCircleOutlined />,
      label: <Link href="/admin/disputes">การร้องเรียน</Link>,
    },
    {
      key: "mystery-boxes",
      icon: <GiftOutlined />,
      label: <Link href="/admin/mystery-boxes">กล่องสุ่ม</Link>,
    },
    {
      key: "bots",
      icon: <RobotOutlined />,
      label: <Link href="/admin/bots">Bots</Link>,
    },
    {
      key: "cards",
      icon: <CreditCardOutlined />,
      label: <Link href="/admin/cards">Cards Catalog</Link>,
    },
    {
      key: "merch",
      icon: <AppstoreOutlined />,
      label: <Link href="/admin/merch">Merchandise</Link>,
    },
    {
      key: "audit-log",
      icon: <AuditOutlined />,
      label: <Link href="/admin/audit-log">Audit Log</Link>,
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
