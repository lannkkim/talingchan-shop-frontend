"use client";

import React from "react";
import { Layout, Menu } from "antd";
import { UserOutlined, SafetyCertificateOutlined, DashboardOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Sider } = Layout;

export default function AdminSidebar() {
  const pathname = usePathname();
  
  // Determine selected key
  const getSelectedKey = () => {
    if (pathname.includes("/admin/users")) return "users";
    if (pathname.includes("/admin/roles")) return "roles";
    return "dashboard";
  };

  const items = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: <Link href="/admin/users">User Management</Link>,
    },
    {
      key: "roles",
      icon: <SafetyCertificateOutlined />,
      label: <Link href="/admin/roles">Role Management</Link>,
    },
  ];

  return (
    <Sider width={250} theme="light" className="border-r border-gray-100 min-h-screen">
      <div className="p-4 text-center border-b border-gray-100 mb-2">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
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
