"use client";

import React from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  Card,
  Typography,
  App,
  Row,
  Col,
} from "antd";
import {
  UploadOutlined,
  BankOutlined,
  ShopOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { registerShop, getBanks, Bank } from "@/services/shop";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function ShopRegistrationForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useTranslations("Shop.registration");
  const [form] = Form.useForm();
  const { message } = App.useApp();

  // Queries
  const { data: banks = [], isLoading: banksLoading } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: getBanks,
  });

  // Mutations
  const registerMutation = useMutation({
    mutationFn: (values: any) => registerShop(values),
    onSuccess: () => {
      message.success(t("messages.success"));
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/shop";
      }
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      message.error(error.response?.data?.message || t("messages.error"));
    },
  });

  const onFinish = (values: any) => {
    const formData = new FormData();
    formData.append("shop_name", values.shop_name);
    if (values.shop_email) formData.append("shop_email", values.shop_email);
    if (values.shop_phone) formData.append("shop_phone", values.shop_phone);
    formData.append("bank_id", values.bank_id);
    formData.append("bank_account", values.account_number);
    if (values.account_name) formData.append("bank_account_name", values.account_name);
    if (values.branch) formData.append("branch", values.branch);

    if (values.book_image && values.book_image.length > 0) {
      formData.append("bank_book_image", values.book_image[0].originFileObj);
    }
    
    registerMutation.mutate(formData);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <ShopOutlined className="text-5xl text-blue-600 mb-4" />
        <Title level={2}>{t("title")}</Title>
        <Paragraph className="text-gray-500 max-w-md mx-auto">
          {t("description")}
        </Paragraph>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark="optional"
        className="space-y-6"
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card title={t("profile.title")} className="h-full shadow-sm border-gray-100">
              <Form.Item
                name="shop_name"
                label={t("profile.shopName")}
                rules={[{ required: true, message: "Required" }]}
              >
                <Input prefix={<ShopOutlined className="text-gray-400" />} />
              </Form.Item>

              <Form.Item
                name="shop_email"
                label={t("profile.shopEmail")}
                rules={[
                  { required: true, message: "Required" },
                  { type: "email", message: "Invalid email" }
                ]}
              >
                <Input prefix={<MailOutlined className="text-gray-400" />} />
              </Form.Item>

              <Form.Item
                name="shop_phone"
                label={t("profile.shopPhone")}
                rules={[{ required: true, message: "Required" }]}
              >
                <Input prefix={<PhoneOutlined className="text-gray-400" />} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={t("bank.title")} className="h-full shadow-sm border-gray-100">
              <Form.Item
                name="bank_id"
                label={t("bank.name")}
                rules={[{ required: true, message: "Required" }]}
              >
                <Select loading={banksLoading}>
                  {banks.map((bank) => (
                    <Option key={bank.bank_id} value={bank.bank_id}>
                      {bank.bank_shortname} - {bank.bank_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="account_name"
                label={t("bank.holderName")}
                rules={[{ required: true, message: "Required" }]}
              >
                <Input prefix={<UserOutlined className="text-gray-400" />} />
              </Form.Item>

              <Form.Item
                name="account_number"
                label={t("bank.number")}
                rules={[{ required: true, message: "Required" }]}
              >
                <Input prefix={<BankOutlined className="text-gray-400" />} />
              </Form.Item>

              <Form.Item
                name="branch"
                label={t("bank.branch")}
              >
                <Input />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Card title={t("verification.title")} className="shadow-sm border-gray-100">
          <Form.Item
            name="book_image"
            label={t("verification.bookImage")}
            valuePropName="fileList"
            getValueFromEvent={normFile}
            extra={t("verification.bookImageExtra")}
            rules={[{ required: true, message: "Required" }]}
          >
            <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Card>

        <div className="flex justify-center pt-6">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={registerMutation.isPending}
            className="px-12 h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700"
          >
            {t("actions.submit")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
