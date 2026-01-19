"use client";

import React from "react";
import CardBrowser from "@/components/shared/CardBrowser";
import PageHeader from "@/components/shared/PageHeader";
import { Layout, ConfigProvider } from "antd";

const { Content } = Layout;

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
        <PageHeader title="คลัง" />

        <Layout className="w-full">
          <Content className="container mx-auto max-w-7xl p-4 md:p-8">
            <CardBrowser selectable={false} />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
