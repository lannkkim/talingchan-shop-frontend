"use client";

import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Upload,
  message,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyShopProfile } from "@/services/shop";
import { ShopProfile, UpdateShopProfileInput } from "@/types/shop";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

const { Title, Text } = Typography;

interface ShopProfileFormProps {
  shopData: ShopProfile;
}

export default function ShopProfileForm({ shopData }: ShopProfileFormProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const t = useTranslations("Shop.form");

  useEffect(() => {
    if (shopData) {
      form.setFieldsValue({
        shop_name: shopData.shop_profile?.shop_name,
        shop_display: shopData.shop_profile?.shop_display,
        shop_phone: shopData.shop_profile?.shop_phone,
        shop_email: shopData.shop_profile?.shop_email,
      });
    }
  }, [shopData, form]);

  const updateMutation = useMutation({
    mutationFn: (values: UpdateShopProfileInput) => updateMyShopProfile(values),
    onSuccess: () => {
      message.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["myShop"] });
    },
    onError: () => {
      message.error(t("error"));
    },
  });

  const onFinish = (values: UpdateShopProfileInput) => {
    updateMutation.mutate(values);
  };

  return (
    <Card className="shadow-sm rounded-xl border-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
          <ShopOutlined style={{ fontSize: "24px" }} />
        </div>
        <div>
          <Title level={4} className="!mb-0">
            {t("title")}
          </Title>
          <Text type="secondary">{t("description")}</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="max-w-3xl"
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="shop_name"
              label={t("shopName")}
              rules={[{ required: true, message: t("shopNameError") }]}
            >
              <Input
                prefix={<ShopOutlined className="text-gray-400" />}
                placeholder={t("shopNamePlaceholder")}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="shop_display" label={t("displayName")}>
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder={t("displayNamePlaceholder")}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} className="mb-4 text-gray-600">
          {t("contactInfo")}
        </Title>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="shop_phone" label={t("phone")}>
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder={t("phonePlaceholder")}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="shop_email" label={t("email")}>
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder={t("emailPlaceholder")}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="mt-4">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            loading={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 h-10 px-8"
          >
            {t("save")}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
