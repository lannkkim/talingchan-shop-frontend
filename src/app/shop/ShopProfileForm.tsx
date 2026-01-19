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
import { UserOutlined, ShopOutlined, PhoneOutlined, MailOutlined, SaveOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyShopProfile } from "@/services/shop";
import { ShopProfile, UpdateShopProfileInput } from "@/types/shop";
import { useEffect } from "react";

const { Title, Text } = Typography;

interface ShopProfileFormProps {
  shopData: ShopProfile;
}

export default function ShopProfileForm({ shopData }: ShopProfileFormProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

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
      message.success("อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว");
      queryClient.invalidateQueries({ queryKey: ["myShop"] });
    },
    onError: () => {
      message.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    },
  });

  const onFinish = (values: UpdateShopProfileInput) => {
    updateMutation.mutate(values);
  };

  return (
    <Card className="shadow-sm rounded-xl border-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <ShopOutlined style={{ fontSize: '24px' }} />
        </div>
        <div>
            <Title level={4} className="!mb-0">ข้อมูลร้านค้า</Title>
            <Text type="secondary">จัดการข้อมูลทั่วไปของร้านค้าของคุณ</Text>
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
              label="ชื่อร้านค้า (Official Name)"
              rules={[{ required: true, message: "กรุณาระบุชื่อร้านค้า" }]}
            >
              <Input prefix={<ShopOutlined className="text-gray-400" />} placeholder="เช่น Talingchan Official" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
             <Form.Item
              name="shop_display"
              label="ชื่อที่แสดง (Display Name)"
            >
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="ชื่อที่จะแสดงหน้าร้าน" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} className="mb-4 text-gray-600">ข้อมูลการติดต่อ</Title>

        <Row gutter={24}>
           <Col xs={24} md={12}>
            <Form.Item
              name="shop_phone"
              label="เบอร์โทรศัพท์"
            >
              <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="เบอร์โทรศัพท์ติดต่อ" size="large" />
            </Form.Item>
           </Col>
           <Col xs={24} md={12}>
            <Form.Item
              name="shop_email"
              label="อีเมลร้านค้า"
            >
              <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="example@shop.com" size="large" />
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
            บันทึกการเปลี่ยนแปลง
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
