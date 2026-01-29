"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  Card,
  Typography,
  Divider,
  App,
  Row,
  Col,
} from "antd";
import { UploadOutlined, BankOutlined, ShopOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { registerShop, getBanks, Bank } from "@/services/shop";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function ShopRegistrationForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message, modal } = App.useApp();
  const router = useRouter();
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await getBanks();
      setBanks(data);
    } catch (error) {
      console.error("Failed to fetch banks", error);
      message.error("Failed to load bank list");
    }
  };
  
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("shop_name", values.shop_name);
      if (values.shop_display) formData.append("shop_display", values.shop_display);
      if (values.shop_email) formData.append("shop_email", values.shop_email);
      if (values.shop_phone) formData.append("shop_phone", values.shop_phone);
      if (values.owner_name) formData.append("owner_name", values.owner_name);
      
      formData.append("bank_id", values.bank_id);
      formData.append("bank_account", values.bank_account);
      if (values.bank_account_name) formData.append("bank_account_name", values.bank_account_name);
      if (values.bank_branch) formData.append("branch", values.bank_branch); // Mapped to 'branch' in DB

      if (values.bank_book_image && values.bank_book_image.length > 0) {
        formData.append("bank_book_image", values.bank_book_image[0].originFileObj);
      }

      await registerShop(formData);
      
      modal.success({
        title: "Registration Successful",
        content: "Your shop application has been submitted. Please wait for verification.",
        onOk: () => {
          // Redirect or reload
          // window.location.reload(); 
          // Ideally redirect to /shop which matches the condition
          window.location.href = "/shop";
        },
      });
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      const isImage = file.type === "image/jpeg" || file.type === "image/png";
      if (!isImage) {
        message.error("You can only upload JPG/PNG file!");
      }
      return false; // Prevent auto upload
    },
    maxCount: 1,
  };

  return (
    <div className="flex justify-center py-10">
      <Card 
        className="w-full max-w-3xl shadow-lg border-t-4 border-t-blue-500"
        title={
          <div className="text-center py-4">
            <Title level={2} className="m-0 text-blue-600"><ShopOutlined /> Register Your Shop</Title>
            <Text type="secondary">Join our marketplace and start selling today!</Text>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
          size="large"
          initialValues={{
              shop_display: "",
              shop_email: "",
              shop_phone: "",
          }}
        >
          <Divider titlePlacement="left">Shop Information</Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="shop_name"
                label="Shop Name"
                rules={[{ required: true, message: "Please enter shop name" }]}
              >
                <Input placeholder="e.g. My Awesome Store" prefix={<ShopOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shop_display" label="Display Name (Optional)">
                <Input placeholder="Shop display name" />
              </Form.Item>
            </Col>
            <Col span={12}>
               <Form.Item name="owner_name" label="Owner Name (Optional)">
                <Input placeholder="Your full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shop_email" label="Contact Email" rules={[{ type: 'email' }]}>
                <Input placeholder="Email for customers" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="shop_phone" label="Contact Phone">
                <Input placeholder="Phone for customers" />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left">Bank Information</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                 name="bank_id"
                 label="Bank"
                 rules={[{ required: true, message: "Please select a bank" }]}
              >
                 <Select placeholder="Select Bank" showSearch optionFilterProp="children">
                    {banks.map((bank) => (
                      <Option key={bank.bank_id} value={bank.bank_id}>
                         {bank.bank_shortname} - {bank.bank_name}
                      </Option>
                    ))}
                 </Select>
              </Form.Item>
            </Col>
             <Col span={12}>
              <Form.Item name="bank_branch" label="Branch">
                <Input placeholder="Bank Branch" prefix={<EnvironmentOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bank_account"
                label="Account Number"
                rules={[{ required: true, message: "Please enter account number" }]}
              >
                <Input placeholder="e.g. 123-4-56789-0" prefix={<BankOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bank_account_name" label="Account Name">
                <Input placeholder="Name on bank account" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bank_book_image"
            label="Bank Book Image"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
            rules={[{ required: true, message: "Please upload bank book image" }]}
          >
            <Upload {...uploadProps} listType="picture-card">
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Divider />

          <Form.Item className="text-center">
            <Button type="primary" htmlType="submit" size="large" loading={loading} className="w-full md:w-1/3 h-12 text-lg bg-blue-600 hover:bg-blue-700">
              Submit Application
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
