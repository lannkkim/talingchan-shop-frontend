"use client";

import { useQuery } from "@tanstack/react-query";
import { Table, Typography, DatePicker, Space, Input, Button } from "antd";
import { useState } from "react";
import { getAuditLogs } from "@/services/audit";
import type { AuditLog } from "@/types/audit";
import { formatDate } from "@/utils/format";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];

const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function AdminAuditLogPage() {
  const [filters, setFilters] = useState<{
    action?: string;
    target_type?: string;
    from?: string;
    to?: string;
  }>({});

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "audit-logs", filters],
    queryFn: () => getAuditLogs(filters),
    select: (data) => data ?? [],
  });

  const columns: ColumnsType<AuditLog> = [
    {
      title: "แอดมิน",
      dataIndex: "admin_id",
      key: "admin_id",
      render: (v: string) => <Text strong>{v.substring(0, 8)}</Text>,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (v: string) => <code className="text-xs bg-gray-100 px-1 py-0.5">{v}</code>,
    },
    {
      title: "Target",
      key: "target",
      render: (_: any, record: AuditLog) => (
        <Text type="secondary" className="text-xs">
          {record.target_type}
          {record.target_id && ` / ${record.target_id.substring(0, 8)}`}
        </Text>
      ),
    },
    {
      title: "เวลา",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => (
        <Text type="secondary" className="text-xs">{formatDate(v, true)}</Text>
      ),
    },
  ];

  return (
    <ManagementPageLayout
      title="Audit Log"
      description="บันทึกการกระทำของแอดมินทั้งหมด"
      extra={
        <Space wrap>
          <Input
            placeholder="Action..."
            style={{ width: 160 }}
            onChange={(e) =>
              setFilters((f) => ({ ...f, action: e.target.value || undefined }))
            }
          />
          <Input
            placeholder="Target type..."
            style={{ width: 160 }}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                target_type: e.target.value || undefined,
              }))
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
        dataSource={logs}
        rowKey="audit_log_id"
        loading={isLoading}
        pagination={{ pageSize: 30 }}
        size="small"
      />
    </ManagementPageLayout>
  );
}
