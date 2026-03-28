"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Typography,
  Tag,
  Modal,
  InputNumber,
  Form,
  Space,
  App,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { getMyPayouts, requestPayout } from "@/services/payout";
import { getSellerBalance } from "@/services/ledger";
import type { Payout } from "@/types/payout";
import { formatCurrency, formatDate } from "@/utils/format";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  PENDING: "blue",
  PROCESSING: "orange",
  COMPLETED: "green",
  FAILED: "red",
};

const statusLabel: Record<string, string> = {
  PENDING: "รอดำเนินการ",
  PROCESSING: "กำลังดำเนินการ",
  COMPLETED: "สำเร็จ",
  FAILED: "ล้มเหลว",
};

export default function ShopPayouts() {
  const { message: antMessage } = App.useApp();
  const queryClient = useQueryClient();
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["shop", "payouts"],
    queryFn: getMyPayouts,
  });

  const { data: balance } = useQuery({
    queryKey: ["ledger", "balance"],
    queryFn: getSellerBalance,
  });

  const requestMutation = useMutation({
    mutationFn: (values: { amount: number }) =>
      requestPayout({ amount: String(values.amount) }),
    onSuccess: () => {
      antMessage.success("ส่งคำขอถอนเงินสำเร็จ");
      setRequestModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["shop", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["ledger", "balance"] });
    },
    onError: (err: any) => {
      antMessage.error(err?.response?.data?.error || "เกิดข้อผิดพลาด");
    },
  });

  const columns: ColumnsType<Payout> = [
    {
      title: "รหัส",
      dataIndex: "payout_code",
      key: "payout_code",
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      render: (v: string) => <Text strong>{formatCurrency(v)}</Text>,
    },
    {
      title: "สุทธิ",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (v: string) => (
        <Text strong className="text-green-600">
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={statusColor[v]}>{statusLabel[v] || v}</Tag>
      ),
    },
    {
      title: "วันที่ขอ",
      dataIndex: "requested_at",
      key: "requested_at",
      render: (v: string) => formatDate(v),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Title level={2} className="!mb-1">
          ถอนเงิน
        </Title>
        <Text type="secondary">จัดการการถอนเงินรายได้ร้านค้า</Text>
      </div>

      {/* Balance Card */}
      <div className="bg-black text-white p-6">
        <Text className="text-gray-300 block text-sm">ยอดคงเหลือที่ถอนได้</Text>
        <div className="text-3xl font-bold mt-1">
          {formatCurrency(balance?.balance || "0")}
        </div>
        <Button
          className="mt-4 border-white text-white hover:!bg-white hover:!text-black"
          icon={<PlusOutlined />}
          onClick={() => setRequestModalOpen(true)}
        >
          ขอถอนเงิน
        </Button>
      </div>

      {/* Payout History */}
      <Table
        columns={columns}
        dataSource={payouts}
        rowKey="payout_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        size="small"
      />

      {/* Request Modal */}
      <Modal
        title="ขอถอนเงิน"
        open={requestModalOpen}
        onCancel={() => setRequestModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={requestMutation.mutate}>
          <div className="mb-4 p-3 bg-gray-50">
            <Text type="secondary" className="text-xs">ยอดคงเหลือ</Text>
            <div className="text-lg font-bold">
              {formatCurrency(balance?.balance || "0")}
            </div>
          </div>
          <Form.Item
            label="จำนวนเงินที่ต้องการถอน (ขั้นต่ำ ฿100)"
            name="amount"
            rules={[
              { required: true, message: "กรุณาระบุจำนวนเงิน" },
              { type: "number", min: 100, message: "ขั้นต่ำ ฿100" },
            ]}
          >
            <InputNumber
              className="w-full"
              min={100}
              step={100}
              formatter={(v) => `฿ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => (v ? Number(v.replace(/฿\s?|(,*)/g, "")) : 0) as any}
            />
          </Form.Item>
          <Space className="w-full justify-end">
            <Button onClick={() => setRequestModalOpen(false)}>ยกเลิก</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={requestMutation.isPending}
            >
              ยืนยัน
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
