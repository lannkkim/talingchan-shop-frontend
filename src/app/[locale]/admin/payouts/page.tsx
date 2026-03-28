"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Table, Button, Tag, Space, Input, Modal, Form, App } from "antd";
import { CheckOutlined, CloseOutlined, SyncOutlined } from "@ant-design/icons";
import {
  getAdminPayouts,
  processAdminPayout,
  completeAdminPayout,
  failAdminPayout,
} from "@/services/payout";
import type { Payout } from "@/types/payout";
import { formatCurrency, formatDate } from "@/utils/format";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];

const statusColor: Record<string, string> = {
  PENDING: "blue",
  PROCESSING: "orange",
  COMPLETED: "green",
  FAILED: "red",
};

export default function AdminPayoutsPage() {
  const { message: antMessage } = App.useApp();
  const queryClient = useQueryClient();
  const [completeModal, setCompleteModal] = useState<string | null>(null);
  const [failModal, setFailModal] = useState<string | null>(null);
  const [form] = Form.useForm();

  const { data: payouts = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "payouts"],
    queryFn: () => getAdminPayouts(),
  });

  const processMutation = useMutation({
    mutationFn: processAdminPayout,
    onSuccess: () => {
      antMessage.success("เปลี่ยนสถานะเป็น กำลังดำเนินการ");
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { bank_ref?: string; notes?: string } }) =>
      completeAdminPayout(id, data),
    onSuccess: () => {
      antMessage.success("ดำเนินการสำเร็จ");
      setCompleteModal(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });
    },
  });

  const failMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { notes?: string } }) =>
      failAdminPayout(id, data),
    onSuccess: () => {
      antMessage.success("บันทึกการล้มเหลวแล้ว");
      setFailModal(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });
    },
  });

  const columns: ColumnsType<Payout> = [
    {
      title: "รหัส",
      dataIndex: "payout_code",
      key: "payout_code",
    },
    {
      title: "Shop ID",
      dataIndex: "shop_id",
      key: "shop_id",
      ellipsis: true,
    },
    {
      title: "จำนวน",
      dataIndex: "amount",
      key: "amount",
      render: (v: string) => formatCurrency(v),
    },
    {
      title: "สุทธิ",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (v: string) => (
        <span className="text-green-600 font-semibold">{formatCurrency(v)}</span>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag>,
    },
    {
      title: "Bank Ref",
      dataIndex: "bank_ref",
      key: "bank_ref",
      render: (v?: string) => v || "-",
    },
    {
      title: "วันที่ขอ",
      dataIndex: "requested_at",
      key: "requested_at",
      render: (v: string) => formatDate(v),
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_: any, record: Payout) => (
        <Space size="small">
          {record.status === "PENDING" && (
            <Button
              size="small"
              icon={<SyncOutlined />}
              onClick={() => processMutation.mutate(record.payout_id)}
              loading={processMutation.isPending}
            >
              ดำเนินการ
            </Button>
          )}
          {record.status === "PROCESSING" && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setCompleteModal(record.payout_id)}
              >
                สำเร็จ
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => setFailModal(record.payout_id)}
              >
                ล้มเหลว
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ManagementPageLayout
      title="จัดการการถอนเงิน"
      extra={
        <Button onClick={() => refetch()}>โหลดใหม่</Button>
      }
    >
      <Table
        columns={columns}
        dataSource={payouts}
        rowKey="payout_id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        size="small"
      />

      <Modal
        title="ยืนยันการโอนสำเร็จ"
        open={!!completeModal}
        onCancel={() => setCompleteModal(null)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            completeMutation.mutate({ id: completeModal!, data: values })
          }
        >
          <Form.Item label="Bank Reference" name="bank_ref">
            <Input placeholder="หมายเลขอ้างอิงการโอน" />
          </Form.Item>
          <Form.Item label="หมายเหตุ" name="notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space className="justify-end w-full">
            <Button onClick={() => setCompleteModal(null)}>ยกเลิก</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={completeMutation.isPending}
            >
              ยืนยัน
            </Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        title="บันทึกการล้มเหลว"
        open={!!failModal}
        onCancel={() => setFailModal(null)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            failMutation.mutate({ id: failModal!, data: values })
          }
        >
          <Form.Item label="สาเหตุ" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Space className="justify-end w-full">
            <Button onClick={() => setFailModal(null)}>ยกเลิก</Button>
            <Button
              danger
              htmlType="submit"
              loading={failMutation.isPending}
            >
              ยืนยัน
            </Button>
          </Space>
        </Form>
      </Modal>
    </ManagementPageLayout>
  );
}
