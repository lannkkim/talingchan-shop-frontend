"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyShop } from "@/services/shop";
import {
  Layout,
  Spin,
  Button,
  Typography,
  Result,
  ConfigProvider,
  Menu,
  theme,
  Avatar,
  Card,
  Space
} from "antd";
import {
  ShopOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import PageHeader from "@/components/shared/PageHeader";
import ShopProfileForm from "./ShopProfileForm";
import ShopStockSettings from "./ShopStockSettings";
import ShopOrders from "./ShopOrders";
import ShopProducts from "./ShopProducts";
import Link from "next/link";
import ShopRegistrationForm from "./ShopRegistrationForm";
import ShopAddressManagement from "./ShopAddressManagement";
import ShopRevenue from "./ShopRevenue";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
    InputNumber: {
      borderRadius: 0,
      controlHeight: 48,
      activeBorderColor: "#000000",
      hoverBorderColor: "#000000",
    },
    Select: {
      borderRadius: 0,
      controlHeight: 48,
      colorPrimary: "#000000",
      controlItemBgActive: "#f5f5f5",
    },
    Card: {
      borderRadius: 0,
      boxShadow: "none",
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
    Form: {
      labelColor: "#000000",
      labelFontSize: 12,
    },
    Typography: {
      fontFamily: "var(--font-inter)",
    },
  },
};

export default function ShopPage() {
  const { user, isAuthenticated, loading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  
  const t = useTranslations("Shop");
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeMenu, setActiveMenu] = useState(tab || "info");

  useEffect(() => {
    if (tab) {
      setActiveMenu(tab);
    }
  }, [tab]);

  const {
    data: shopData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myShop"],
    queryFn: getMyShop,
    retry: false,
    enabled: isAuthenticated,
  });

  const renderContent = () => {
    switch (activeMenu) {
      case "info":
        return shopData ? (
          <div className="space-y-8 max-w-4xl">
            <div className="mb-6">
              <Title level={2} className="!mb-1">ข้อมูลร้านค้า</Title>
              <Text type="secondary">จัดการข้อมูลร้านค้าและการตั้งค่า</Text>
            </div>
            <ShopProfileForm shopData={shopData} />
            <ShopStockSettings shopData={shopData} />
          </div>
        ) : <div />;
      case "products":
        return <ShopProducts />;
      case "orders":
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <Title level={2} className="!mb-1">คำสั่งซื้อ</Title>
              <Text type="secondary">จัดการคำสั่งซื้อของร้านค้า</Text>
            </div>
            <ShopOrders />
          </div>
        );
      case "revenue":
        return <ShopRevenue />;
      case "addresses":
        return <ShopAddressManagement />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <ConfigProvider theme={bottegaTheme}>
        <Layout className="min-h-screen bg-white">
          <PageHeader title="Shop Management" subtitle="จัดการข้อมูลร้านค้า" />
          <Content className="flex justify-center items-center h-[calc(100vh-64px)]">
            <div className="flex flex-col items-center gap-4">
              <Spin size="large" />
              <Text type="secondary">{t("loading")}</Text>
            </div>
          </Content>
        </Layout>
      </ConfigProvider>
    );
  }

  if (shopData?.status === "pending_approve") {
    return (
      <ConfigProvider theme={bottegaTheme}>
        <Layout className="min-h-screen bg-white">
          <PageHeader title="Shop Management" />
          <Content className="container mx-auto max-w-3xl py-12 px-4">
            <Result
              status="info"
              title="รอการอนุมัติร้านค้า"
              subTitle="คำขอเปิดร้านค้าของคุณกำลังอยู่ในระหว่างการตรวจสอบ กรุณารอเจ้าหน้าที่อนุมัติ"
              extra={
                <Link href="/">
                  <Button type="primary">กลับสู่หน้าหลัก</Button>
                </Link>
              }
            />
          </Content>
        </Layout>
      </ConfigProvider>
    );
  }

  if (isError || !shopData) {
    if (isRegistering) {
      return (
        <ConfigProvider theme={bottegaTheme}>
          <Layout className="min-h-screen bg-white">
            <PageHeader title="Shop Registration" subtitle="สมัครเปิดร้านค้า" onBack={() => setIsRegistering(false)} />
            <Content className="container mx-auto max-w-3xl py-8 px-4">
              <ShopRegistrationForm />
            </Content>
          </Layout>
        </ConfigProvider>
      );
    }

    return (
      <ConfigProvider theme={bottegaTheme}>
        <Layout className="min-h-screen bg-white">
          <PageHeader title="Shop Management" />
          <Content className="container mx-auto max-w-7xl py-12 px-4">
            <div className="flex flex-col items-center justify-center space-y-8 py-20 border border-dashed border-gray-200 rounded-lg max-w-4xl mx-auto">
              <ShopOutlined className="text-8xl text-gray-200" />
              <div className="text-center space-y-2">
                <Title level={2}>ยังไม่มีร้านค้าใช่ไหม?</Title>
                <Text className="text-lg text-gray-500 block max-w-lg mx-auto">
                  เริ่มต้นธุรกิจของคุณกับเราได้ง่ายๆ เพียงสมัครเปิดร้านค้าเพื่อวางขายสินค้าของคุณ
                </Text>
              </div>
              <Button type="primary" size="large" className="px-12" onClick={() => setIsRegistering(true)}>
                สมัครเปิดร้านค้า
              </Button>
            </div>
          </Content>
        </Layout>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={bottegaTheme}>
      <Layout className="min-h-screen bg-white">
        <PageHeader title="Shop Management" />
        <Layout className="has-sider">
          <Sider
            width={280}
            theme="light"
            className="border-r border-gray-100 !bg-white sticky top-0 h-[calc(100vh-64px)] overflow-y-auto"
            breakpoint="lg"
            collapsedWidth="0"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                  <ShopOutlined className="text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <Text strong className="block truncate text-base">{shopData.shop_profile?.shop_name || "My Shop"}</Text>
                  <Text type="secondary" className="text-xs">Shop Owner</Text>
                </div>
              </div>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[activeMenu]}
              onClick={({ key }) => setActiveMenu(key)}
              items={[
                {
                  key: "info",
                  icon: <UserOutlined />,
                  label: t("tabs.info"),
                },
                {
                  key: "products",
                  icon: <AppstoreOutlined />,
                  label: t("tabs.products"),
                },
                {
                  key: "orders",
                  icon: <FileTextOutlined />,
                  label: t("tabs.orders"),
                },
                {
                  key: "revenue",
                  icon: <ShopOutlined />,
                  label: t("tabs.revenue"),
                },
                {
                  key: "addresses",
                  icon: <EnvironmentOutlined />,
                  label: t("tabs.addresses"),
                },
              ]}
              className="border-none px-2 py-4"
            />
          </Sider>
          <Content className="p-8 bg-white overflow-y-auto h-[calc(100vh-64px)]">
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
