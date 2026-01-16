"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyShop } from "@/services/shop";
import { Layout, Tabs, Spin, Alert, Empty, Button, Typography, Result } from "antd";
import { UserOutlined, ShopOutlined, AppstoreOutlined, FileTextOutlined } from "@ant-design/icons";
import PageHeader from "@/components/shared/PageHeader";
import ShopProfileForm from "./ShopProfileForm";
import ShopStockSettings from "./ShopStockSettings";
import ShopOrders from "./ShopOrders";
import Link from "next/link";

const { Content } = Layout;
const { Title, Text } = Typography;
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ShopPage() {
  const { user, isAuthenticated, loading: isAuthLoading } = useAuth();
  const router = useRouter();

  const { data: shopData, isLoading, isError } = useQuery({
    queryKey: ["myShop"],
    queryFn: getMyShop,
    retry: false, 
    enabled: isAuthenticated && (user?.role?.name === "shop" || user?.role?.name === "admin"),
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
      ) : <div />, 
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2">
            <AppstoreOutlined />
            สินค้าของฉัน
        </span>
      ),
      children: (
        <div className="py-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
             <Empty description="จัดการสินค้าของคุณได้ที่เมนู Products" />
             <Link href="/products/me" className="mt-4 inline-block">
                <Button type="primary">ไปที่จัดการสินค้า</Button>
             </Link>
        </div>
      ),
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
            <Text type="secondary">กำลังโหลดข้อมูลร้านค้า...</Text>
          </div>
        </Content>
      </Layout>
    );
  }

  if (isError || !shopData) {
    return (
      <Layout className="min-h-screen">
        <PageHeader title="Shop Management" />
        <Content className="container mx-auto max-w-7xl py-12 px-4">
             <Result
                status="403"
                title="คุณยังไม่มีร้านค้า"
                subTitle="ดูเหมือนว่าบัญชีของคุณยังไม่ได้เปิดใช้งานร้านค้า หรือคุณไม่มีสิทธิ์เข้าถึง"
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
      <PageHeader title="Shop Management" subtitle={`จัดการร้านค้า: ${shopData.shop_profile.shop_name}`} />
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
