"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Table, Typography, Tag, App, Empty, Skeleton, Layout } from "antd";
import { PlusOutlined, DatabaseOutlined } from "@ant-design/icons";
import { StockCard } from "@/types/stock";
import { getMyStockCards } from "@/services/stock";
import AddStockCardModal from "./AddStockCardModal";
import PageHeader from "@/components/shared/PageHeader";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;
const { Content } = Layout;

export default function StockPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["stock-cards"],
    queryFn: getMyStockCards,
  });
  const stockCards = data || [];

  const columns: ColumnsType<StockCard> = useMemo(() => [
    {
      title: "Card Name",
      key: "name",
      render: (_, record) => record.cards?.name || "Unknown",
    },
    {
      title: "Rarity",
      key: "rarity",
      render: (_, record) => (
        <Tag color={record.cards?.rare === "SSR" ? "gold" : "blue"}>
          {record.cards?.rare || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      render: (val) => <strong>{val}</strong>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ], []);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["stock-cards"] });
  };

  return (
    <Layout className="min-h-screen">
      <PageHeader title="My Stock"/>
      
      <Content className="p-6 container mx-auto">
        <div className="max-w-[1200px] mx-auto bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-end mb-6">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              size="large"
            >
              Add Card
            </Button>
          </div>

        {isLoading ? (
           <Skeleton active paragraph={{ rows: 10 }} />
        ) : isError ? (
           <Empty description="Error loading stock data" />
        ) : stockCards.length === 0 ? (
            <Empty
              image={<DatabaseOutlined style={{ fontSize: 60, color: '#e5e7eb' }} />}
              description="You don't have any cards in your stock yet."
            >
                <Button type="primary" onClick={() => setModalVisible(true)}>Add Your First Card</Button>
            </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={stockCards}
            rowKey="stock_card_id"
            pagination={{ pageSize: 20 }}
            rowClassName="hover:bg-gray-50 cursor-pointer"
          />
        )}

        <AddStockCardModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={handleSuccess}
        />
        </div>
      </Content>
    </Layout>
  );
}
