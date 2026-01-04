"use client";

import React from "react";
import CardSelector from "@/components/shared/CardSelector";
import { Layout, Typography, ConfigProvider } from "antd";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

export default function CardsPage() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <Layout className="min-h-screen bg-white">
        <Header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 md:px-8 h-auto py-4">
          <div className="container mx-auto">
            <Title level={2} className="!mb-0 tracking-tight">
              Collection
            </Title>
            <Text type="secondary" className="text-sm">
              Browse and explore the full card collection
            </Text>
          </div>
        </Header>

        <Content className="container mx-auto px-4 py-8">
          <CardSelector selectable={false} />
        </Content>

        <Footer className="text-center bg-white border-t border-gray-100 py-12">
          <Text type="secondary" className="text-xs">
            Talingchan Collection &copy; {new Date().getFullYear()}
          </Text>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
