"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import { Table, Button, Tag, Empty, Card, Typography, Space, Modal, Row, Col, Divider } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { getCardImageUrl } from "@/utils/image";

const { Text, Title } = Typography;

export default function ShopProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  // Filter only sell orders
  const sellProducts = products.filter(
    (p: Product) => p.transaction_type?.code === "sell"
  );

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Product) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.description && <Text type="secondary" className="text-xs">{record.description}</Text>}
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
        const count = record.product_stock_card?.length || 0;
        return <Text>{count} card{count !== 1 ? 's' : ''}</Text>;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => <Text strong>{quantity || 1}</Text>,
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
          size="small"
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Title level={5} className="!mb-1">สินค้าตั้งขาย (Sell Orders)</Title>
          <Text type="secondary">จัดการสินค้าที่คุณตั้งขายทั้งหมด</Text>
        </div>
        <Link href="/shop/product/add">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            เพิ่มสินค้าตั้งขาย
          </Button>
        </Link>
      </div>

      {sellProducts.length > 0 ? (
        <Table
          columns={columns}
          dataSource={sellProducts}
          rowKey="product_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Card className="text-center py-12">
          <Empty
            description={
              <Space orientation="vertical">
                <Text strong>ยังไม่มีสินค้าตั้งขาย</Text>
                <Text type="secondary">เริ่มต้นเพิ่มสินค้าตั้งขายของคุณได้เลย</Text>
              </Space>
            }
          />
          <Link href="/shop/product/add" className="mt-4 inline-block">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              เพิ่มสินค้าตั้งขาย
            </Button>
          </Link>
        </Card>
      )}

      {/* Product Detail Modal */}
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
                <Title level={5} className="mb-4">
                  Cards ({selectedProduct.product_stock_card?.reduce((sum, pc) => sum + pc.quantity, 0) || 0} items)
                </Title>
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                  {selectedProduct.product_stock_card?.map(pc => {
                    const card = pc.stock_card?.cards || pc.card;
                    const cardImageUrl = getCardImageUrl(card?.image_name);
                    return (
                      <div key={pc.product_stock_card_id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                        <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={cardImageUrl}
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
                        <Text type="secondary">Product Quantity</Text>
                        <Text strong>{selectedProduct.quantity || 1}</Text>
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
    </div>
  );
}
