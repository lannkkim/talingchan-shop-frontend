"use client";

import { useQuery } from "@tanstack/react-query";
import { Table, Typography, Tag, DatePicker, Input, Space, Button } from "antd";
import { useState } from "react";
import { getAdminLedger } from "@/services/ledger";
import type { LedgerEntry } from "@/types/ledger";
import { formatCurrency, formatDate } from "@/utils/format";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];

const { Text } = Typography;
const { RangePicker } = DatePicker;

const accountTypeColor: Record<string, string> = {
  ESCROW: "blue",
  SELLER_EARNINGS: "green",
  PLATFORM_FEE: "purple",
  REFUND: "red",
};

export default function AdminLedgerPage() {
  const [filters, setFilters] = useState<{
    shop_id?: string;
    account_type?: string;
    from?: string;
    to?: string;
  }>({});

  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "ledger", filters],
    queryFn: () => getAdminLedger(filters),
  });

  const columns: ColumnsType<LedgerEntry> = [
    {
      title: "Account Type",
      dataIndex: "account_type",
      key: "account_type",
      render: (v: string) => <Tag color={accountTypeColor[v] || "default"}>{v}</Tag>,
    },
    {
      title: "Owner",
      dataIndex: "owner_id",
      key: "owner_id",
      render: (v: string) => <Text className="font-mono text-xs">{v.substring(0, 12)}...</Text>,
    },
    {
      title: "Type",
      dataIndex: "entry_type",
      key: "entry_type",
      render: (v: string) => (
        <Tag color={v === "CREDIT" ? "green" : "red"}>{v}</Tag>
      ),
    },
    {
      title: "จำนวน",
      dataIndex: "amount",
      key: "amount",
      render: (v: string, record: LedgerEntry) => (
        <Text
          strong
          className={record.entry_type === "CREDIT" ? "text-green-600" : "text-red-500"}
        >
          {record.entry_type === "CREDIT" ? "+" : "-"}
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "คงเหลือหลัง",
      dataIndex: "balance_after",
      key: "balance_after",
      render: (v: string) => formatCurrency(v),
    },
    {
      title: "Reference",
      key: "reference",
      render: (_: any, record: LedgerEntry) => (
        <Text type="secondary" className="text-xs">
          {record.reference_type} / {record.reference_id.substring(0, 8)}
        </Text>
      ),
    },
    {
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (v?: string) => v || "-",
    },
    {
      title: "เวลา",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => <Text type="secondary" className="text-xs">{formatDate(v, true)}</Text>,
    },
  ];

  return (
    <ManagementPageLayout
      title="Ledger"
      description="บันทึกธุรกรรมทางการเงินทั้งหมด"
      extra={
        <Space wrap>
          <Input
            placeholder="Shop ID..."
            style={{ width: 200 }}
            onChange={(e) =>
              setFilters((f) => ({ ...f, shop_id: e.target.value || undefined }))
            }
          />
          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setFilters((f) => ({
                  ...f,
                  from: dates[0]?.toISOString(),
                  to: dates[1]?.toISOString(),
                }));
              } else {
                setFilters((f) => ({ ...f, from: undefined, to: undefined }));
              }
            }}
          />
          <Button onClick={() => refetch()}>โหลดใหม่</Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={entries}
        rowKey="ledger_entry_id"
        loading={isLoading}
        pagination={{ pageSize: 30 }}
        size="small"
      />
    </ManagementPageLayout>
  );
}
