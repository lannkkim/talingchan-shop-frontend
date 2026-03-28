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
  InputNumber,
  Select,
  Switch,
  App,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getFeeRules, createFeeRule, updateFeeRule, deleteFeeRule } from "@/services/fee";
import type { FeeRule, CreateFeeRuleInput } from "@/types/fee";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];

export default function AdminFeeRulesPage() {
  const { message: antMessage, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FeeRule | null>(null);
  const [form] = Form.useForm();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["admin", "fee-rules"],
    queryFn: getFeeRules,
  });

  const createMutation = useMutation({
    mutationFn: createFeeRule,
    onSuccess: () => {
      antMessage.success("สร้างกฎค่าธรรมเนียมสำเร็จ");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin", "fee-rules"] });
    },
    onError: () => antMessage.error("เกิดข้อผิดพลาด"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFeeRuleInput> }) =>
      updateFeeRule(id, data),
    onSuccess: () => {
      antMessage.success("อัปเดตสำเร็จ");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin", "fee-rules"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeeRule,
    onSuccess: () => {
      antMessage.success("ลบสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["admin", "fee-rules"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (rule: FeeRule) => {
    setEditing(rule);
    form.setFieldsValue({
      ...rule,
      fee_value: Number(rule.fee_value),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: "ยืนยันการลบ",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmit = (values: any) => {
    const input: CreateFeeRuleInput = {
      ...values,
      fee_value: String(values.fee_value),
    };
    if (editing) {
      updateMutation.mutate({ id: editing.fee_rule_id, data: input });
    } else {
      createMutation.mutate(input);
    }
  };

  const columns: ColumnsType<FeeRule> = [
    {
      title: "ชื่อ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ประเภทสินค้า",
      dataIndex: "product_type_flag",
      key: "product_type_flag",
      render: (v?: string) => v || <span className="text-gray-400">ทั้งหมด</span>,
    },
    {
      title: "รูปแบบการขาย",
      dataIndex: "sell_type_code",
      key: "sell_type_code",
      render: (v?: string) => v || <span className="text-gray-400">ทั้งหมด</span>,
    },
    {
      title: "ประเภทค่าธรรมเนียม",
      dataIndex: "fee_type",
      key: "fee_type",
      render: (v: string) => (
        <Tag color={v === "PERCENTAGE" ? "blue" : "purple"}>{v}</Tag>
      ),
    },
    {
      title: "อัตรา/จำนวน",
      key: "fee_value",
      render: (_: any, record: FeeRule) => (
        <span>
          {record.fee_type === "PERCENTAGE"
            ? `${(Number(record.fee_value) * 100).toFixed(2)}%`
            : `฿${record.fee_value}`}
        </span>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
    },
    {
      title: "สถานะ",
      dataIndex: "is_active",
      key: "is_active",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "red"}>{v ? "ใช้งาน" : "ปิด"}</Tag>
      ),
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_: any, record: FeeRule) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.fee_rule_id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <ManagementPageLayout
      title="กฎค่าธรรมเนียม"
      description="จัดการอัตราค่าธรรมเนียมแพลตฟอร์ม"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          เพิ่มกฎ
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={rules}
        rowKey="fee_rule_id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        size="small"
      />

      <Modal
        title={editing ? "แก้ไขกฎค่าธรรมเนียม" : "เพิ่มกฎค่าธรรมเนียม"}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ fee_type: "PERCENTAGE", paid_by: "SELLER", priority: 0, is_active: true }}>
          <Form.Item label="ชื่อ" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="product_type_flag" name="product_type_flag">
              <Input placeholder="เว้นว่าง = ทั้งหมด" />
            </Form.Item>
            <Form.Item label="sell_type_code" name="sell_type_code">
              <Input placeholder="เว้นว่าง = ทั้งหมด" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="ประเภท" name="fee_type" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="PERCENTAGE">PERCENTAGE</Select.Option>
                <Select.Option value="FIXED">FIXED</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="อัตรา/จำนวน" name="fee_value" rules={[{ required: true }]}>
              <InputNumber min={0} step={0.01} className="w-full" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Priority" name="priority">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item label="Paid by" name="paid_by">
              <Select>
                <Select.Option value="SELLER">SELLER</Select.Option>
                <Select.Option value="BUYER">BUYER</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item label="ใช้งาน" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Space className="justify-end w-full">
            <Button onClick={closeModal}>ยกเลิก</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? "บันทึก" : "สร้าง"}
            </Button>
          </Space>
        </Form>
      </Modal>
    </ManagementPageLayout>
  );
}
