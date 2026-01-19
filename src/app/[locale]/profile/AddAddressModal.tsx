"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, Checkbox, Button, App } from "antd";
import { createAddress, getAddressTypes } from "@/services/address";
import { CreateAddressInput, AddressType } from "@/types/address";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

interface AddAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const { Option } = Select;

export default function AddAddressModal({
  visible,
  onClose,
  onSuccess,
}: AddAddressModalProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const t = useTranslations("Profile.address");

  const { data: addressTypes = [] } = useQuery<AddressType[]>({
    queryKey: ["addressTypes"],
    queryFn: getAddressTypes,
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Find shipping type
      const shippingType = addressTypes.find(
        (t) => t.name.toLowerCase() === "shipping",
      );
      const payload = {
        ...values,
        address_type_id: shippingType?.address_type_id || 1, // Fallback to 1 if not found
      };

      await createAddress(payload as CreateAddressInput);
      message.success(t("success.added"));
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      const msg = error.response?.data?.error || t("error.add");
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t("modal.title")}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      afterClose={() => form.resetFields()}
      okText={t("modal.save")}
      cancelText={t("modal.cancel")}
    >
      <Form form={form} layout="vertical">
        <div className="flex gap-4">
          <Form.Item
            name="name"
            label={t("modal.name")}
            className="flex-1"
            rules={[{ required: true, message: t("modal.nameError") }]}
          >
            <Input placeholder={t("modal.namePlaceholder")} />
          </Form.Item>
          <Form.Item
            name="phone"
            label={t("modal.phone")}
            className="flex-1"
            rules={[{ required: true, message: t("modal.phoneError") }]}
          >
            <Input placeholder={t("modal.phonePlaceholder")} />
          </Form.Item>
        </div>

        <Form.Item
          name="address"
          label={t("modal.address")}
          rules={[{ required: true, message: t("modal.addressError") }]}
        >
          <Input.TextArea
            rows={2}
            placeholder={t("modal.addressPlaceholder")}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="sub_district"
            label={t("modal.subDistrict")}
            rules={[{ required: true, message: t("modal.subDistrictError") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="district"
            label={t("modal.district")}
            rules={[{ required: true, message: t("modal.districtError") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="province"
            label={t("modal.province")}
            rules={[{ required: true, message: t("modal.provinceError") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="zipcode"
            label={t("modal.zipcode")}
            rules={[{ required: true, message: t("modal.zipcodeError") }]}
          >
            <Input />
          </Form.Item>
        </div>

        <Form.Item name="is_default" valuePropName="checked">
          <Checkbox>{t("modal.setDefault")}</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
