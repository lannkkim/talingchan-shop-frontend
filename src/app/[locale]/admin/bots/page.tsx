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
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { getAdminBots, createBot, updateBot, deleteBot, bulkImportBots } from "@/services/bot";
import BulkImportModal from "@/components/shared/BulkImportModal";
import type { BotCatalog } from "@/types/bot";
import { formatCurrency } from "@/utils/format";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];

export default function AdminBotsPage() {
  const { message: antMessage, modal } = App.useApp();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<BotCatalog | null>(null);
  const [form] = Form.useForm();

  const { data: bots = [], isLoading } = useQuery({
    queryKey: ["admin", "bots"],
    queryFn: getAdminBots,
  });

  const createMutation = useMutation({
    mutationFn: createBot,
    onSuccess: () => {
      antMessage.success("สร้าง Bot สำเร็จ");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin", "bots"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateBot(id, data),
    onSuccess: () => {
      antMessage.success("อัปเดตสำเร็จ");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin", "bots"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBot,
    onSuccess: () => {
      antMessage.success("ลบสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["admin", "bots"] });
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const openEdit = (bot: BotCatalog) => {
    setEditing(bot);
    form.setFieldsValue({ ...bot, price: Number(bot.price) });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: "ยืนยันการลบ",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmit = (values: any) => {
    const data = { ...values, price: String(values.price) };
    if (editing) {
      updateMutation.mutate({ id: editing.bot_catalog_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns: ColumnsType<BotCatalog> = [
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
      title: "สถานะ",
      dataIndex: "is_active",
      key: "is_active",
      render: (v: boolean) => <Tag color={v ? "green" : "red"}>{v ? "เปิด" : "ปิด"}</Tag>,
    },
    {
      title: "การจัดการ",
      key: "actions",
      render: (_: any, record: BotCatalog) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.bot_catalog_id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <ManagementPageLayout
      title="Bot Catalog"
      description="จัดการรายการบอทอัตโนมัติ"
      extra={
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
            นำเข้า CSV
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            เพิ่ม Bot
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={bots}
        rowKey="bot_catalog_id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />

      <BulkImportModal
        open={importOpen}
        onClose={() => { setImportOpen(false); queryClient.invalidateQueries({ queryKey: ["admin", "bots"] }); }}
        onImport={bulkImportBots}
        title="นำเข้า Bot จาก CSV"
        csvDescription="CSV header: name,bot_type,series,description,image_url"
      />

      <Modal
        title={editing ? "แก้ไข Bot" : "เพิ่ม Bot"}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ is_active: true }}>
          <Form.Item label="ชื่อ" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="รายละเอียด" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="ราคา (฿)" name="price" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
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
