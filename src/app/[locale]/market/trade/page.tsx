"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { getProducts, getProduct } from "@/services/product";
import { useAuth } from "@/contexts/AuthContext";
import { App, Card, Spin, Typography, Row, Col, Layout, Button, Empty, Tag, ConfigProvider, Modal, Skeleton } from "antd";
import { ShoppingOutlined, PlusOutlined, SwapOutlined } from "@ant-design/icons";
import PageHeader from "@/components/shared/PageHeader";
import { getCardImageUrl } from "@/utils/image";
import Image from "next/image";
import Link from "next/link";
import TradeProductCard from "@/components/market/TradeProductCard";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function TradePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Query for Trade Products
  const { data: tradeProducts = [], isLoading } = useQuery({
    queryKey: ["products", "market", "trade", "all"],
    queryFn: () => getProducts({
      status: "active",
      is_admin_shop: false,
      transaction_type_code: "trade",
      include_shop: true,
      limit: 100, // Show more for dedicated page
    }),
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch full details when selected
  const { data: detailedProduct, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["product", selectedProduct?.product_id],
    queryFn: () => getProduct(selectedProduct!.product_id),
    enabled: !!selectedProduct,
  });

  // Use detailedProduct if available, otherwise selectedProduct (for immediate feedback)
  const activeProduct = detailedProduct || selectedProduct;

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <Layout className="min-h-screen">
        <PageHeader title="ตลาดแลกเปลี่ยน (Trade Market)" backUrl="/market" />
        <Layout className="w-full">
          <Content className="container mx-auto max-w-7xl p-4 md:p-8">
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={2} className="!mb-0">รายการแลกเปลี่ยนทั้งหมด</Title>
                    <Text type="secondary">ค้นหาและแลกเปลี่ยนการ์ดที่คุณต้องการกับผู้เล่นคนอื่น</Text>
                </div>
                {user && (
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<PlusOutlined />} 
                        onClick={() => router.push("/market/trade/add")}
                    >
                        สร้างโพสต์แลกเปลี่ยน
                    </Button>
                )}
            </div>

            {tradeProducts.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {tradeProducts.map((p: Product) => (
                        <Col key={p.product_id} xs={24} lg={12} xl={12}>
                            <TradeProductCard product={p} onClick={handleProductClick} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty 
                    description="ยังไม่มีรายการแลกเปลี่ยนในขณะนี้" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    className="my-20"
                >
                    {user && (
                        <Button type="primary" onClick={() => router.push("/market/trade/add")}>
                            เริ่มสร้างรายการแรกเลย!
                        </Button>
                    )}
                </Empty>
            )}


            {/* Trade Detail Modal */}
            <Modal
                title={<span className="text-lg">รายละเอียดการแลกเปลี่ยน</span>}
                open={!!selectedProduct}
                onCancel={() => setSelectedProduct(null)}
                footer={null}
                width={1000}
                destroyOnHidden
            >
                {activeProduct && (
                    <Skeleton loading={isLoadingDetail} active>
                    <Row gutter={24} className="mt-4">
                        {/* Left Column: Offering (Have) */}
                        <Col span={10} className="border-r border-gray-100">
                            <Title level={5} type="secondary" className="mb-4">ผู้เสนอ (Offering)</Title>
                            
                            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50/50 rounded-lg">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {activeProduct.users?.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                    <Text strong className="block">{activeProduct.users?.username}</Text>
                                    <Text type="secondary" className="text-xs">Owner</Text>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {activeProduct.product_stock_card?.map(pc => {
                                    const card = pc.stock_card?.card || pc.card;
                                    return (
                                        <div key={pc.product_stock_card_id} className="flex gap-3 p-2 border rounded-lg hover:border-blue-200 transition-colors">
                                            <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                 <Image
                                                    src={getCardImageUrl(card?.image_name, "thumb")}
                                                    alt={card?.name || ""}
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <div>
                                                <Text strong className="block">{card?.name}</Text>
                                                <Tag color="gold" className="mt-1">{card?.rare}</Tag>
                                                <div className="mt-1">
                                                    <Tag>x{pc.quantity}</Tag>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Col>

                        {/* Right Column: Wants (Options) */}
                        <Col span={14}>
                            <Title level={5} type="secondary" className="mb-4">สิ่งที่ต้องการ (Looking For)</Title>
                            <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6">
                                {activeProduct.trade_wants?.map((pkg, idx) => (
                                    <div key={pkg.package_id} className="p-4 border rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <Tag color="cyan" className="text-sm px-2 py-0.5 m-0">Option {idx + 1}</Tag>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {pkg.products?.map(prod => (
                                                <div key={prod.product_id}>
                                                    {prod.product_stock_card?.map(pc => {
                                                        const card = pc.stock_card?.card || pc.card;
                                                        return (
                                                            <div key={pc.product_stock_card_id} className="flex gap-3 items-center bg-white p-2 rounded border">
                                                                 <div className="relative w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                                    <Image
                                                                        src={getCardImageUrl(card?.image_name, "thumb")}
                                                                        alt={card?.name || ""}
                                                                        fill
                                                                        className="object-contain"
                                                                        unoptimized
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Text className="text-sm block">{card?.name}</Text>
                                                                    <div className="flex gap-1 mt-0.5">
                                                                        <Tag className="text-[10px] m-0">{card?.rare}</Tag>
                                                                        <Tag color="blue" className="text-[10px] m-0">x{pc.quantity}</Tag>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 text-right">
                                            {user && user.users_id !== activeProduct.user_id && (
                                                <Button size="small" type="primary" ghost>เสนอแลกเปลี่ยน (Coming Soon)</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!activeProduct.trade_wants || activeProduct.trade_wants.length === 0) && (
                                    <Empty description="ไม่มีข้อมูลสิ่งที่ต้องการ" />
                                )}
                            </div>
                        </Col>
                    </Row>
                    </Skeleton>
                )}
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
