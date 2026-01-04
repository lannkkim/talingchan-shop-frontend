"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import { Layout, Typography, Button, Table, Tag, Space, Card, Empty, Skeleton } from "antd";
import { PlusOutlined, ShoppingOutlined } from "@ant-design/icons";
import Link from "next/link";
import { ProductList } from "@/types/product";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function ProductsPage() {
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: ProductList) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.detail && <Text type="secondary">{record.detail}</Text>}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: any) => type ? <Tag color="blue">{type.name}</Tag> : <Tag>N/A</Tag>,
    },
    {
      title: "Cards",
      key: "cards",
      render: (_: any, record: ProductList) => (
        <div className="space-y-1">
          {record.product_card?.map(pc => (
            <div key={pc.product_card_id} className="text-sm">
              <Text>{pc.cards?.name || `Card #${pc.card_id}`}</Text>
              <Text type="secondary" className="ml-2">x{pc.quantity}</Text>
            </div>
          ))}
        </div>
      ),
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
      render: (_: any, record: ProductList) => (
        <Button size="small">Manage</Button>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-white">
      <Header className="bg-white border-b border-gray-100 flex items-center justify-between px-8 h-20">
        <div>
          <Title level={2} className="!mb-0">My Products</Title>
          <Text type="secondary">Manage your card collections and listings</Text>
        </div>
        <Link href="/products/add">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Add Product
          </Button>
        </Link>
      </Header>

      <Content className="p-8 container mx-auto">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : isError ? (
          <Empty description="Error loading products" />
        ) : products.length === 0 ? (
          <Card className="text-center py-20 bg-gray-50 border-dashed border-2">
            <Empty
              image={<ShoppingOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
              description={
                <Space orientation="vertical">
                  <Text strong>No products yet</Text>
                  <Text type="secondary">Start by adding your first card or deck</Text>
                  <Link href="/products/add">
                    <Button type="primary" ghost icon={<PlusOutlined />} className="mt-4">
                      Add Product Now
                    </Button>
                  </Link>
                </Space>
              }
            />
          </Card>
        ) : (
          <Table 
            columns={columns} 
            dataSource={products} 
            rowKey="product_list_id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Content>
    </Layout>
  );
}
