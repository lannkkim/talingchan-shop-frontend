"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getMerch, bulkImportMerch } from "@/services/merch";
import BulkImportModal from "@/components/shared/BulkImportModal";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import type { TableProps } from "antd";
import type { Merch } from "@/services/merch";
type ColumnsType<T> = TableProps<T>["columns"];

export default function AdminMerchPage() {
  const queryClient = useQueryClient();
  const [importOpen, setImportOpen] = useState(false);

  const { data: merch = [], isLoading } = useQuery({
    queryKey: ["admin", "merch"],
    queryFn: () => getMerch({ limit: 100 }),
    select: (data) => data ?? [],
  });

  const columns: ColumnsType<Merch> = [
    { title: "ชื่อ", dataIndex: "name", key: "name" },
    { title: "Image", dataIndex: "image_name", key: "image_name", render: (v) => v || "-" },
  ];

  return (
    <ManagementPageLayout
      title="Merchandise Catalog"
      description="จัดการรายการสินค้าตัวอย่าง"
      extra={
        <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
          นำเข้า CSV
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={merch}
        rowKey="merch_id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />

      <BulkImportModal
        open={importOpen}
        onClose={() => { setImportOpen(false); queryClient.invalidateQueries({ queryKey: ["admin", "merch"] }); }}
        onImport={bulkImportMerch}
        title="นำเข้า Merch จาก CSV"
        csvDescription="CSV header: name,detail,image_name,merch_type_id"
      />
    </ManagementPageLayout>
  );
}
