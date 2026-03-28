"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  App,
} from "antd";
import { EyeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { getAdminDisputes, resolveDispute } from "@/services/dispute";
import type { Dispute } from "@/types/dispute";
import { formatDate } from "@/utils/format";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];

const { Text } = Typography;

const statusColor: Record<string, string> = {
  OPEN: "blue",
  UNDER_REVIEW: "orange",
  RESOLVED: "green",
  CLOSED: "default",
};

export default function AdminDisputesPage() {
  const { message: antMessage } = App.useApp();
  const queryClient = useQueryClient();
  const [resolveModal, setResolveModal] = useState<Dispute | null>(null);
  const [form] = Form.useForm();

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["admin", "disputes"],
    queryFn: getAdminDisputes,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { resolution: string; outcome: string } }) =>
      resolveDispute(id, data as any),
    onSuccess: () => {
      antMessage.success("แก้ไขการร้องเรียนสำเร็จ");
      setResolveModal(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
    onError: () => antMessage.error("เกิดข้อผิดพลาด"),
  });

  const columns: ColumnsType<Dispute> = [
    {
      title: "Order",
      dataIndex: "order_id",
      key: "order_id",
      render: (v: string) => (
        <Text className="font-mono text-xs">{v.substring(0, 8)}</Text>
      ),
    },
    {
      title: "ผู้ร้องเรียน",
      key: "complainant",
      render: (_: any, record: Dispute) => (
        <Text>{record.complainant?.username || record.complainant_id.substring(0, 8)}</Text>
      ),
    },
    {
      title: "เหตุผล",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag>,
    },
    {
      title: "วันที่",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => formatDate(v),
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_: any, record: Dispute) => (
        <Button
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => setResolveModal(record)}
          disabled={record.status === "RESOLVED" || record.status === "CLOSED"}
        >
          แก้ไข
        </Button>
      ),
    },
  ];

  return (
    <ManagementPageLayout title="การร้องเรียน" description="จัดการการร้องเรียนจากผู้ใช้">
      <Table
        columns={columns}
        dataSource={disputes}
        rowKey="dispute_id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        size="small"
      />

      <Modal
        title={`แก้ไขการร้องเรียน`}
        open={!!resolveModal}
        onCancel={() => setResolveModal(null)}
        footer={null}
        width={500}
      >
        {resolveModal && (
          <div className="mb-4 p-3 bg-gray-50 text-sm space-y-1">
            <div><Text type="secondary">เหตุผล: </Text><Text>{resolveModal.reason}</Text></div>
            {resolveModal.description && (
              <div><Text type="secondary">รายละเอียด: </Text><Text>{resolveModal.description}</Text></div>
            )}
          </div>
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            resolveMutation.mutate({ id: resolveModal!.dispute_id, data: values })
          }
        >
          <Form.Item label="ผลการตัดสิน" name="outcome" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="BUYER_WINS">ผู้ซื้อชนะ</Select.Option>
              <Select.Option value="SELLER_WINS">ผู้ขายชนะ</Select.Option>
              <Select.Option value="MUTUAL">ตกลงกันเอง</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="การแก้ไขปัญหา" name="resolution" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Space className="justify-end w-full">
            <Button onClick={() => setResolveModal(null)}>ยกเลิก</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={resolveMutation.isPending}
            >
              บันทึก
            </Button>
          </Space>
        </Form>
      </Modal>
    </ManagementPageLayout>
  );
}
