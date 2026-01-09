"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, Checkbox, Button, App } from "antd";
import { createAddress } from "@/services/address";
import { CreateAddressInput } from "@/types/address";

interface AddAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { Option } = Select;

export default function AddAddressModal({ visible, onClose, onSuccess }: AddAddressModalProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await createAddress(values as CreateAddressInput);
      message.success("Address added successfully");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
        if (error.errorFields) {
            // Form validation error, do nothing
            return;
        }
      const msg = error.response?.data?.error || "Failed to add address";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Address"
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      afterClose={() => form.resetFields()}
      okText="Save Address"
    >
      <Form form={form} layout="vertical">
        <div className="flex gap-4">
             <Form.Item
                name="name"
                label="Recipient Name"
                className="flex-1"
                rules={[{ required: true, message: "Please enter recipient name" }]}
            >
                <Input placeholder="John Doe" />
            </Form.Item>
             <Form.Item
                name="phone" // Note: Schema might need phone if we want to store it. Wait, check schema.
                // Addresses table has `phone`? Let me check schema address.prisma.
                // It has `address` string txt. I'll stick to schema fields.
                // Wait, address.prisma had: first_name, last_name, phone -> User deleted them and made `name`.
                // So now we only have `name`.
                // I will stick to `name` only for now.
                hidden
            >
                <Input />
            </Form.Item>
        </div>

        <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please enter house number, soi, road" }]}
        >
            <Input.TextArea rows={2} placeholder="123/45 Moo 6, Soi 5, Sukhumvit Rd." />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
            <Form.Item
                name="sub_district"
                label="Sub-district (Tambon)"
                rules={[{ required: true, message: "Required" }]}
            >
                <Input />
            </Form.Item>
             <Form.Item
                name="district"
                label="District (Amphoe)"
                rules={[{ required: true, message: "Required" }]}
            >
                <Input />
            </Form.Item>
             <Form.Item
                name="province"
                label="Province (Changwat)"
                rules={[{ required: true, message: "Required" }]}
            >
                <Input />
            </Form.Item>
             <Form.Item
                name="zipcode"
                label="Zipcode"
                rules={[{ required: true, message: "Required" }]}
            >
                <Input />
            </Form.Item>
        </div>

        <Form.Item name="is_default" valuePropName="checked">
            <Checkbox>Set as default address</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
