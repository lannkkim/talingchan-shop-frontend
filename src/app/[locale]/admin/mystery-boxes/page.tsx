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
  Switch,
  App,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { getAdminMysteryBoxes, createMysteryBox, updateMysteryBox } from "@/services/mystery-box";
import type { MysteryBox } from "@/types/mystery-box";
import { formatCurrency } from "@/utils/format";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];

export default function AdminMysteryBoxesPage() {
  const { message: antMessage } = App.useApp();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MysteryBox | null>(null);
  const [form] = Form.useForm();

  const { data: boxes = [], isLoading } = useQuery({
    queryKey: ["admin", "mystery-boxes"],
    queryFn: getAdminMysteryBoxes,
  });

  const createMutation = useMutation({
    mutationFn: createMysteryBox,
    onSuccess: () => {
      antMessage.success("สร้างกล่องสุ่มสำเร็จ");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin", "mystery-boxes"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MysteryBox> }) =>
      updateMysteryBox(id, data),
    onSuccess: () => {
      antMessage.success("อัปเดตสำเร็จ");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin", "mystery-boxes"] });
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const openEdit = (box: MysteryBox) => {
    setEditing(box);
    form.setFieldsValue({ ...box, price: Number(box.price) });
    setModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    const data = { ...values, price: String(values.price) };
    if (editing) {
      updateMutation.mutate({ id: editing.mystery_box_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns: ColumnsType<MysteryBox> = [
    {
      title: "ชื่อ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
      render: (v: string) => formatCurrency(v),
    },
    {
      title: "สต็อก",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "สถานะ",
      dataIndex: "is_active",
      key: "is_active",
      render: (v: boolean) => <Tag color={v ? "green" : "red"}>{v ? "เปิด" : "ปิด"}</Tag>,
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_: any, record: MysteryBox) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => openEdit(record)}
        />
      ),
    },
  ];

  return (
    <ManagementPageLayout
      title="กล่องสุ่ม (Mystery Box)"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          เพิ่มกล่องสุ่ม
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={boxes}
        rowKey="mystery_box_id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={editing ? "แก้ไขกล่องสุ่ม" : "เพิ่มกล่องสุ่ม"}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ is_active: true, stock: 100 }}>
          <Form.Item label="ชื่อ" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="รายละเอียด" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="ราคา (฿)" name="price" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item label="สต็อก" name="stock" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item label="เปิดใช้งาน" name="is_active" valuePropName="checked">
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
