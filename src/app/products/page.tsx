"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import PageHeader from "@/components/shared/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Layout, Typography, Button, Table, Tag, Space, Card, Empty, Skeleton, Modal, Row, Col, Tabs } from "antd";
import { PlusOutlined, ShoppingOutlined, EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";

const { Content } = Layout;
const { Text, Title } = Typography;

export default function ProductsPage() {
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const getCardImageUrl = (imageName: string | null | undefined) => {
    return imageName
      ? `${API_URL}/uploads/cards/${imageName.endsWith(".png") ? imageName : `${imageName}.png`}`
      : "/images/card-placeholder.png";
  };

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    render: (text: string, record: Product) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.description && <Text type="secondary">{record.description}</Text>}
        </Space>
      ),
    },
    {
      title: "Price",
      key: "price",
      render: (_: any, record: Product) => {
        const activePrice = record.price_period?.find(p => p.status === "active") || record.price_period?.[0];
        return activePrice ? (
          <Text strong>฿{Number(activePrice.price).toLocaleString()}</Text>
        ) : <Text type="secondary">-</Text>;
      },
    },
    {
      title: "Type",
      dataIndex: "product_type",
      key: "type",
      render: (type: any) => type ? <Tag color="blue">{type.name}</Tag> : <Tag>N/A</Tag>,
    },
    {
      title: "Cards",
      key: "cards",
      render: (_: any, record: Product) => {
        const displayText = record.product_stock_card?.slice(0, 5);
        const remaining = (record.product_stock_card?.length || 0) - 5;
        
        return (
          <div className="space-y-1">
            {displayText?.map(pc => {
              const card = pc.stock_card?.cards;
              return (
                <div key={pc.product_stock_card_id} className="text-sm">
                  <Text>{card?.name || `Card #${pc.stock_card?.card_id}`}</Text>
                  {card?.rare && <Tag className="ml-2 mr-0" color="gold">{card.rare}</Tag>}
                  <Text type="secondary" className="ml-2">x{pc.quantity}</Text>
                </div>
              );
            })}
            {remaining > 0 && (
              <Text type="secondary" className="text-xs block pt-1">
                + {remaining} more cards...
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Active Until",
      dataIndex: "ended_at",
      key: "ended_at",
      render: (date: string) => date ? new Date(date).toLocaleString() : <Text type="secondary">Indefinite</Text>,
    },
    {
      title: "Price Valid Until",
      key: "price_valid_until",
      render: (_: any, record: Product) => {
        const activePrice = record.price_period?.find(p => p.status === "active") || record.price_period?.[0];
        return activePrice?.price_period_ended ? (
          <Text>{new Date(activePrice.price_period_ended).toLocaleString()}</Text>
        ) : <Text type="secondary">-</Text>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "orange"}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Product) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => {
            setSelectedProduct(record);
            setIsModalOpen(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const [activeTab, setActiveTab] = React.useState("sell");
  
  const filteredProducts = React.useMemo(() => {
    return products.filter((p: Product) => 
      p.transaction_type?.code?.toLowerCase() === activeTab
    );
  }, [products, activeTab]);

  const EmptyState = () => (
    <Card className="text-center py-20 bg-gray-50 border-dashed border-2">
      <Empty
        image={<ShoppingOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
        description={
          <Space orientation="vertical">
            <Text strong>No products found</Text>
            <Text type="secondary">Try changing tabs or add a new product</Text>
            <Link href="/products/add">
              <Button type="primary" ghost icon={<PlusOutlined />} className="mt-4">
                Add Product Now
              </Button>
            </Link>
          </Space>
        }
      />
    </Card>
  );

  const { user } = useAuth();
  const canSell = user?.permissions?.includes("product:create:sell");

  const items = [
    ...(canSell ? [{
      key: 'sell',
      label: 'Sell Order',
      children: filteredProducts.length > 0 ? (
        <Table 
          columns={columns} 
          dataSource={filteredProducts} 
          rowKey="product_id"
          pagination={{ pageSize: 10 }}
        />
      ) : <EmptyState />,
    }] : []),
    {
      key: 'buy',
      label: 'Buy Order',
      children: filteredProducts.length > 0 ? (
        <Table 
          columns={columns} 
          dataSource={filteredProducts} 
          rowKey="product_id"
          pagination={{ pageSize: 10 }}
        />
      ) : <EmptyState />,
    },
  ];

  // Effect to ensure active tab is valid
  React.useEffect(() => {
    if (activeTab === 'sell' && !canSell) {
      setActiveTab('buy');
    }
  }, [canSell, activeTab]);

  return (
    <Layout className="min-h-screen bg-white">
      <PageHeader 
        title="My Products" 
      />

      <Content className="p-8 container mx-auto">
        <div className="flex justify-end mb-6">
          <Link href="/products/add">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Add Product
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : isError ? (
          <Empty description="Error loading products" />
        ) : (
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        )}

        {/* Product View Modal */}
        <Modal
          title={selectedProduct?.name}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={800}
          destroyOnHidden
        >
          {selectedProduct && (
            <div className="mt-4">
              <Row gutter={24}>
                {/* Left Column: Cards List */}
                <Col span={12} className="border-r border-gray-100">
                  <Title level={5} className="mb-4">Cards ({selectedProduct.product_stock_card?.reduce((sum, pc) => sum + pc.quantity, 0) || 0} items)</Title>
                  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                    {selectedProduct.product_stock_card?.map(pc => {
                      const card = pc.stock_card?.cards;
                      return (
                        <div key={pc.product_stock_card_id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                          <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                             <Image // Using next/image requires width/height or fill
                              src={getCardImageUrl(card?.image_name)}
                              alt={card?.name || "Card"}
                              fill
                              className="object-contain"
                              sizes="48px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text strong className="block truncate" title={card?.name}>{card?.name}</Text>
                            <div className="flex items-center gap-2 mt-1">
                              {card?.rare && <Tag className="m-0 text-[10px]" color="gold">{card.rare}</Tag>}
                              <Text type="secondary" className="text-xs">{card?.type}</Text>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Tag color="blue">x{pc.quantity}</Tag>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Col>

                {/* Right Column: Product Details */}
                <Col span={12}>
                  <Title level={5} className="mb-4">Product Details</Title>
                  <Space orientation="vertical" size="middle" className="w-full">
                    <div>
                      <Text type="secondary" className="block text-xs">Description</Text>
                      <Text>{selectedProduct.description || "-"}</Text>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                       <Space orientation="vertical" className="w-full">
                         <div className="flex justify-between items-center">
                            <Text type="secondary">Price</Text>
                            {(() => {
                                const activePrice = selectedProduct.price_period?.find(p => p.status === "active") || selectedProduct.price_period?.[0];
                                return activePrice ? (
                                  <Text strong className="text-lg text-blue-600">฿{Number(activePrice.price).toLocaleString()}</Text>
                                ) : <Text>-</Text>;
                            })()}
                         </div>
                         <div className="flex justify-between items-center">
                            <Text type="secondary">Product Type</Text>
                            <Tag color="blue">{selectedProduct.product_type?.name || "N/A"}</Tag>
                         </div>
                         <div className="flex justify-between items-center">
                            <Text type="secondary">Status</Text>
                            <Tag color={selectedProduct.status === "active" ? "green" : "orange"}>{selectedProduct.status?.toUpperCase()}</Tag>
                         </div>
                       </Space>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                       <div>
                          <Text type="secondary" className="block text-xs">Active Until</Text>
                          <Text>{selectedProduct.ended_at ? new Date(selectedProduct.ended_at).toLocaleString() : "Indefinite"}</Text>
                       </div>
                       <div>
                          <Text type="secondary" className="block text-xs">Price Valid Until</Text>
                          {(() => {
                              const activePrice = selectedProduct.price_period?.find(p => p.status === "active") || selectedProduct.price_period?.[0];
                              return activePrice?.price_period_ended ? (
                                <Text>{new Date(activePrice.price_period_ended).toLocaleString()}</Text>
                              ) : <Text type="secondary">Indefinite (or until changed)</Text>;
                          })()}
                       </div>
                    </div>
                  </Space>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
}
