"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Table, Typography, Tag, App, Empty, Skeleton, Layout, Space } from "antd";
import { PlusOutlined, DatabaseOutlined, EditOutlined } from "@ant-design/icons";
import { StockCard } from "@/types/stock";
import { getMyStockCards } from "@/services/stock";
import AddStockCardModal from "./AddStockCardModal";
import AdjustStockModal from "./AdjustStockModal";
import PageHeader from "@/components/shared/PageHeader";
import type { ColumnsType } from "antd/es/table";
import { Content } from "antd/es/layout/layout";

const { Title } = Typography;

export default function StockPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStockCard, setSelectedStockCard] = useState<StockCard | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const { data: stockCards = [], isLoading, isError } = useQuery({
    queryKey: ["stock-cards"],
    queryFn: getMyStockCards,
  });

  const columns: ColumnsType<StockCard> = useMemo(() => [
    {
      title: "Card Name",
      key: "name",
      render: (_, record) => record.card?.name || "Unknown",
    },
    {
      title: "Rarity",
      key: "rarity",
      render: (_, record) => (
        <Tag color={record.card?.rare === "SSR" ? "gold" : "blue"}>
          {record.card?.rare || "N/A"}
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
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
         <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => {
                setSelectedStockCard(record);
                setIsAdjustModalOpen(true);
            }}
         >
            Adjust
         </Button>
      ),
    },
  ], []);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["stock-cards"] });
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        
        <AdjustStockModal 
            visible={isAdjustModalOpen}
            stockCard={selectedStockCard}
            onClose={() => setIsAdjustModalOpen(false)}
            onSuccess={handleSuccess}
        />
        </div>
      </Content>
    </div>
  );
}
