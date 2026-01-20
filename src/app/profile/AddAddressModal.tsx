"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, Checkbox, Button, App } from "antd";
import { createAddress, getAddressTypes } from "@/services/address";
import { CreateAddressInput, AddressType } from "@/types/address";
import { useQuery } from "@tanstack/react-query";

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
  
  const { data: addressTypes = [] } = useQuery<AddressType[]>({
    queryKey: ["addressTypes"],
    queryFn: getAddressTypes,
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Find shipping type
      const shippingType = addressTypes.find(t => t.name.toLowerCase() === 'shipping');
      const payload = {
        ...values,
        address_type_id: shippingType?.address_type_id || 1 // Fallback to 1 if not found
      };

      await createAddress(payload as CreateAddressInput);
      message.success("เพิ่มที่อยู่สำเร็จ");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
        if (error.errorFields) {
            return;
        }
      const msg = error.response?.data?.error || "เพิ่มที่อยู่ไม่สำเร็จ";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="เพิ่มที่อยู่จัดส่งใหม่"
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      afterClose={() => form.resetFields()}
      okText="บันทึกที่อยู่"
      cancelText="ยกเลิก"
    >
      <Form form={form} layout="vertical">
        <div className="flex gap-4">
             <Form.Item
                name="name"
                label="ชื่อผู้รับ"
                className="flex-1"
                rules={[{ required: true, message: "กรุณาระบุชื่อผู้รับ" }]}
            >
                <Input placeholder="เช่น สมชาย ใจดี" />
            </Form.Item>
             <Form.Item
                name="phone"
                label="เบอร์โทรศัพท์"
                className="flex-1"
                rules={[{ required: true, message: "กรุณาระบุเบอร์โทรศัพท์" }]}
            >
                <Input placeholder="เช่น 0812345678" />
            </Form.Item>
        </div>

        <Form.Item
            name="address"
            label="ที่อยู่"
            rules={[{ required: true, message: "กรุณาระบุบ้านเลขที่ " }]}
        >
            <Input.TextArea rows={2} placeholder="บ้านเลขที่, หมู่, ซอย, ถนน" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
            <Form.Item
                name="sub_district"
                label="ตำบล / แขวง"
                rules={[{ required: true, message: "กรุณาระบุตำบล/แขวง" }]}
            >
                <Input />
            </Form.Item>
             <Form.Item
                name="district"
                label="อำเภอ / เขต"
                rules={[{ required: true, message: "กรุณาระบุอำเภอ/เขต" }]}
            >
                <Input />
            </Form.Item>
             <Form.Item
                name="province"
                label="จังหวัด"
                rules={[{ required: true, message: "กรุณาระบุจังหวัด" }]}
            >
                <Input />
            </Form.Item>
             <Form.Item
                name="zipcode"
                label="รหัสไปรษณีย์"
                rules={[{ required: true, message: "กรุณาระบุรหัสไปรษณีย์" }]}
            >
                <Input />
            </Form.Item>
        </div>

        <Form.Item name="is_default" valuePropName="checked">
            <Checkbox>ตั้งเป็นที่อยู่ค่าเริ่มต้น</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
