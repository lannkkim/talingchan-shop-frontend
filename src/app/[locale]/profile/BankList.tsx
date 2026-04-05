"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Empty,
  Space,
  Skeleton,
  Tag,
  App,
  Modal,
  Form,
  Input,
  Select,
  Switch,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  BankOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyBanks, addBank, updateBank, deleteBank } from "@/services/user-bank";
import type { UserBank, AddBankRequest, UpdateBankRequest } from "@/types/user-bank";
import axiosInstance from "@/lib/axios";

const { Text } = Typography;

interface BankOption {
  bank_id: string;
  bank_name: string;
}

export default function BankList() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserBank | null>(null);
  const [form] = Form.useForm();

  const { data: banks = [], isLoading } = useQuery({
    queryKey: ["user-banks"],
    queryFn: getMyBanks,
  });

  const { data: bankOptions = [] } = useQuery<BankOption[]>({
    queryKey: ["banks"],
    queryFn: async () => {
      const res = await axiosInstance.get<BankOption[]>("/api/v1/banks");
      return res.data;
    },
  });

  const handleAdd = async (values: AddBankRequest) => {
    try {
      await addBank(values);
      message.success("เพิ่มบัญชีธนาคารสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["user-banks"] });
      setAddModalOpen(false);
      form.resetFields();
    } catch {
      message.error("ไม่สามารถเพิ่มบัญชีธนาคารได้");
    }
  };

  const handleUpdate = async (values: UpdateBankRequest) => {
    if (!editTarget) return;
    try {
      await updateBank(editTarget.user_bank_id, values);
      message.success("อัพเดทบัญชีธนาคารสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["user-banks"] });
      setEditTarget(null);
      form.resetFields();
    } catch {
      message.error("ไม่สามารถอัพเดทบัญชีธนาคารได้");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBank(id);
      message.success("ลบบัญชีธนาคารสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["user-banks"] });
    } catch {
      message.error("ไม่สามารถลบบัญชีธนาคารได้ (ไม่สามารถลบบัญชีหลักได้)");
    }
  };

  const openEdit = (bank: UserBank) => {
    setEditTarget(bank);
    form.setFieldsValue({
      account_name: bank.account_name,
      branch: bank.branch,
      is_default: bank.is_default,
    });
  };

  if (isLoading) return <Skeleton active />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Text type="secondary">บัญชีธนาคารของคุณ (สูงสุด 3 บัญชี)</Text>
        {banks.length < 3 && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            เพิ่มบัญชีธนาคาร
          </Button>
        )}
      </div>

      {banks.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="ยังไม่มีบัญชีธนาคาร"
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            เพิ่มบัญชีธนาคาร
          </Button>
        </Empty>
      ) : (
        <div className="space-y-3">
          {banks.map((bank) => (
            <Card
              key={bank.user_bank_id}
              className="border border-gray-200"
              bodyStyle={{ padding: "16px 20px" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <BankOutlined className="text-blue-500 text-lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Text strong>{bank.bank_name || bank.bank_id}</Text>
                      {bank.is_default && (
                        <Tag color="blue" className="text-xs">หลัก</Tag>
                      )}
                      {bank.is_verified && (
                        <Tag icon={<CheckCircleOutlined />} color="success" className="text-xs">
                          ยืนยันแล้ว
                        </Tag>
                      )}
                    </div>
                    <Text className="text-sm font-mono">{bank.bank_account}</Text>
                    {bank.account_name && (
                      <Text type="secondary" className="block text-xs">{bank.account_name}</Text>
                    )}
                    {bank.branch && (
                      <Text type="secondary" className="block text-xs">สาขา: {bank.branch}</Text>
                    )}
                  </div>
                </div>
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(bank)}
                  />
                  {!bank.is_default && (
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(bank.user_bank_id)}
                    />
                  )}
                </Space>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Bank Modal */}
      <Modal
        title="เพิ่มบัญชีธนาคาร"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="bank_id" label="ธนาคาร" rules={[{ required: true, message: "กรุณาเลือกธนาคาร" }]}>
            <Select placeholder="เลือกธนาคาร">
              {bankOptions.map((b) => (
                <Select.Option key={b.bank_id} value={b.bank_id}>
                  {b.bank_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="bank_account" label="เลขบัญชี" rules={[{ required: true, message: "กรุณากรอกเลขบัญชี" }]}>
            <Input placeholder="xxx-x-xxxxx-x" />
          </Form.Item>
          <Form.Item name="account_name" label="ชื่อบัญชี (ตามสมุดบัญชี)" rules={[{ required: true, message: "กรุณากรอกชื่อบัญชี" }]}>
            <Input placeholder="ชื่อ-นามสกุลตามสมุดบัญชี" />
          </Form.Item>
          <Form.Item name="branch" label="สาขา">
            <Input placeholder="ชื่อสาขา" />
          </Form.Item>
          <Form.Item name="is_default" label="ตั้งเป็นบัญชีหลัก" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setAddModalOpen(false); form.resetFields(); }}>ยกเลิก</Button>
            <Button type="primary" htmlType="submit">เพิ่มบัญชี</Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Bank Modal */}
      <Modal
        title="แก้ไขบัญชีธนาคาร"
        open={!!editTarget}
        onCancel={() => { setEditTarget(null); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="account_name" label="ชื่อบัญชี (ตามสมุดบัญชี)">
            <Input placeholder="ชื่อ-นามสกุลตามสมุดบัญชี" />
          </Form.Item>
          <Form.Item name="branch" label="สาขา">
            <Input placeholder="ชื่อสาขา" />
          </Form.Item>
          <Form.Item name="is_default" label="ตั้งเป็นบัญชีหลัก" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setEditTarget(null); form.resetFields(); }}>ยกเลิก</Button>
            <Button type="primary" htmlType="submit">บันทึก</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
