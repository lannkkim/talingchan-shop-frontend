"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Space, Tag } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getCards, bulkImportCards } from "@/services/card";
import BulkImportModal from "@/components/shared/BulkImportModal";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import type { TableProps } from "antd";
import type { Card } from "@/types/card";
type ColumnsType<T> = TableProps<T>["columns"];

export default function AdminCardsPage() {
  const queryClient = useQueryClient();
  const [importOpen, setImportOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["admin", "cards", page],
    queryFn: () => getCards(page, 50),
    select: (data) => data ?? [],
  });

  const columns: ColumnsType<Card> = [
    { title: "ชื่อ", dataIndex: "name", key: "name" },
    { title: "ประเภท", dataIndex: "type", key: "type", render: (v) => v && <Tag>{v}</Tag> },
    { title: "หายาก", dataIndex: "rare", key: "rare", render: (v) => v && <Tag color="gold">{v}</Tag> },
    { title: "Set", dataIndex: "print", key: "print" },
    { title: "ซีรีย์", dataIndex: "soi", key: "soi" },
    { title: "สี", dataIndex: "color", key: "color", render: (v) => v && <Tag color="blue">{v}</Tag> },
  ];

  return (
    <ManagementPageLayout
      title="Card Catalog"
      description="จัดการรายการการ์ดทั้งหมด"
      extra={
        <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
          นำเข้า CSV
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={cards}
        rowKey="card_id"
        loading={isLoading}
        pagination={{
          pageSize: 50,
          current: page,
          onChange: (p) => setPage(p),
        }}
      />

      <BulkImportModal
        open={importOpen}
        onClose={() => { setImportOpen(false); queryClient.invalidateQueries({ queryKey: ["admin", "cards"] }); }}
        onImport={bulkImportCards}
        title="นำเข้าการ์ดจาก CSV"
        csvDescription="CSV header: name,type,print,rare,soi,color,subtype,symbol,cost,gem,power,ex,main_effect,favor_text,image_name"
      />
    </ManagementPageLayout>
  );
}
