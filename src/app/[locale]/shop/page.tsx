"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyShop } from "@/services/shop";
import {
  Layout,
  Tabs,
  Spin,
  Alert,
  Empty,
  Button,
  Typography,
  Result,
} from "antd";
import {
  UserOutlined,
  ShopOutlined,
  AppstoreOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import PageHeader from "@/components/shared/PageHeader";
import ShopProfileForm from "./ShopProfileForm";
import ShopStockSettings from "./ShopStockSettings";
import ShopOrders from "./ShopOrders";
import ShopProducts from "./ShopProducts";
import Link from "next/link";
import ShopRegistrationForm from "./ShopRegistrationForm";

const { Content } = Layout;
const { Title, Text } = Typography;
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function ShopPage() {
  const { user, isAuthenticated, loading: isAuthLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations("Shop");
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    data: shopData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myShop"],
    queryFn: getMyShop,
    retry: false,
    enabled:
      isAuthenticated &&
      (user?.role?.name === "shop" || user?.role?.name === "admin"),
  });

  const items = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-2">
          <ShopOutlined />
          ข้อมูลร้านค้า
        </span>
      ),
      children: shopData ? (
        <div className="space-y-6">
          <ShopProfileForm shopData={shopData} />
          <ShopStockSettings shopData={shopData} />
        </div>
      ) : (
        <div />
      ),
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2">
          <AppstoreOutlined />
          สินค้าของฉัน
        </span>
      ),
      children: <ShopProducts />,
    },
    {
      key: "3",
      label: (
        <span className="flex items-center gap-2">
          <FileTextOutlined />
          คำสั่งซื้อ (Orders)
        </span>
      ),
      children: (
        <div className="space-y-6">
          <ShopOrders />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Layout className="min-h-screen">
        <PageHeader title="Shop Management" subtitle="จัดการข้อมูลร้านค้า" />
        <Content className="container mx-auto max-w-7xl py-8 px-4 flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-4">
            <Spin size="large" />
            <Text type="secondary">{t("loading")}</Text>
          </div>
        </Content>
      </Layout>
    );
  }

  if (isError || !shopData) {
    // If user is just a normal user (not shop/admin), show registration landing
    const isNormalUser = user?.role?.name === "user";

    if (isNormalUser) {
        if (isRegistering) {
            return (
                <Layout className="min-h-screen">
                    <PageHeader title="Shop Registration" subtitle="สมัครเปิดร้านค้า" onBack={() => setIsRegistering(false)} />
                    <Content className="container mx-auto max-w-7xl py-8 px-4">
                        <ShopRegistrationForm />
                    </Content>
                </Layout>
            );
        }

        return (
            <Layout className="min-h-screen">
                <PageHeader title="Shop Management" />
                <Content className="container mx-auto max-w-7xl py-12 px-4">
                    <div className="flex flex-col items-center justify-center space-y-8 py-10 bg-white rounded-lg shadow-sm border border-gray-100 max-w-4xl mx-auto">
                        <ShopOutlined className="text-8xl text-blue-500" />
                        <div className="text-center space-y-2">
                             <Title level={2}>ยังไม่มีร้านค้าใช่ไหม?</Title>
                             <Text className="text-lg text-gray-500 block max-w-lg mx-auto">
                                เริ่มต้นธุรกิจของคุณกับเราได้ง่ายๆ เพียงสมัครเปิดร้านค้าเพื่อวางขายสินค้าของคุณ
                             </Text>
                        </div>
                        <Button type="primary" size="large" className="h-12 px-8 text-lg bg-blue-600" onClick={() => setIsRegistering(true)}>
                            สมัครเปิดร้านค้า (Register Shop)
                        </Button>
                    </div>
                </Content>
            </Layout>
        );
    }

    return (
      <Layout className="min-h-screen">
        <PageHeader title="Shop Management" />
        <Content className="container mx-auto max-w-7xl py-12 px-4">
          <Result
            status="403"
            title="คุณไม่มีสิทธิ์เข้าถึง"
            subTitle="ดูเหมือนว่าคุณไม่มีสิทธิ์เข้าถึงส่วนจัดการร้านค้า"
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                ลองใหม่อีกครั้ง
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <PageHeader
        title="Shop Management"
        subtitle={`จัดการร้านค้า: ${shopData.shop_profile?.shop_name || ""}`}
      />
      <Content className="container mx-auto max-w-7xl py-6 px-4">
        <Tabs
          defaultActiveKey="1"
          items={items}
          type="card"
          size="large"
          className="shop-tabs"
          tabBarStyle={{ marginBottom: 24 }}
        />
      </Content>
    </Layout>
  );
}
