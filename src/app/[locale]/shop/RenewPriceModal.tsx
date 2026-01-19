import React, { useState } from "react";
import { Modal, Form, InputNumber, DatePicker, App } from "antd";
import { Product } from "@/types/product";
import { updateProduct } from "@/services/product";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

interface RenewPriceModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RenewPriceModal: React.FC<RenewPriceModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const t = useTranslations("Shop.products.renewModal");

  const handleSubmit = async () => {
    if (!product) return;
    try {
      const values = await form.validateFields();
      setLoading(true);

      // payload for update
      const payload = {
        price: values.price,
        price_period_ended: values.price_period_ended?.toISOString(),
        status: "active", // Reactivate product
      };

      await updateProduct(product.product_id, payload);

      message.success(t("success"));
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.error) {
        // Handle specific validation/business errors if any
        message.error(error.response.data.error);
      } else {
        message.error(t("error"));
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t("title")}
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={t("ok")}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="price"
          label={t("newPrice")}
          rules={[{ required: true, message: t("newPriceError") }]}
          initialValue={
            product?.price_period?.[0]?.price
              ? Number(product.price_period[0].price)
              : undefined
          }
        >
          <InputNumber
            prefix="฿"
            className="w-full"
            placeholder={t("newPricePlaceholder")}
            min={0}
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="price_period_ended"
          label={t("priceValidUntil")}
          dependencies={["price"]}
        >
          <DatePicker
            className="w-full"
            size="large"
            disabledDate={(current) => {
              // Valid date must be >= today
              return current && current < dayjs().startOf("day");
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
