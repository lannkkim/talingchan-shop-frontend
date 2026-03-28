"use client";

import { Layout, Menu, ConfigProvider } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import PageHeader from "@/components/shared/PageHeader";
import { bottegaTheme } from "@/lib/theme";

const { Content, Sider } = Layout;

interface SidebarLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  menuItems: ItemType[];
  selectedKey: string;
  onMenuClick: (key: string) => void;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export default function SidebarLayout({
  title,
  subtitle,
  onBack,
  menuItems,
  selectedKey,
  onMenuClick,
  header,
  children,
}: SidebarLayoutProps) {
  return (
    <ConfigProvider theme={bottegaTheme}>
      <Layout className="min-h-screen bg-white">
        <PageHeader title={title} subtitle={subtitle} onBack={onBack} />
        <Layout className="has-sider">
          <Sider
            width={280}
            theme="light"
            className="border-r border-gray-100 !bg-white sticky top-0 h-[calc(100vh-64px)] overflow-y-auto"
            breakpoint="lg"
            collapsedWidth="0"
          >
            {header && (
              <div className="p-6 border-b border-gray-100">{header}</div>
            )}
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={({ key }) => onMenuClick(key)}
              items={menuItems}
              className="border-none px-2 py-4"
            />
          </Sider>
          <Content className="p-8 bg-white overflow-y-auto h-[calc(100vh-64px)]">
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
