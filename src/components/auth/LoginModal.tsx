"use client";

import React, { useState } from "react";
import { Modal, Tabs, Form, Input, Button, App, Divider } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { LoginInput, RegisterInput } from "@/types/auth";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LoginModal({ visible, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState("login");
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();
  const { message } = App.useApp();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const handleSocialLogin = (provider: string) => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_URL}/api/v1/auth/${provider}`;
  };

  const handleLogin = async (values: LoginInput) => {
    try {
      setLoading(true);
      await login(values);
      message.success("Logged in successfully");
      onClose();
      form.resetFields();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Login failed";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterInput) => {
    try {
      setLoading(true);
      await register(values);
      message.success("Registered successfully");
      onClose();
      registerForm.resetFields();
    } catch (error: any) {
      // Backend validation errors format: { errors: [{field, message}] }
      const errors = error.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        // Map backend errors to form fields if possible, or just show first one
        message.error(errors[0].message);
      } else {
        const msg = error.response?.data?.error || "Registration failed";
        message.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Social login buttons component
  const SocialLoginButtons = () => (
    <div className="space-y-3">
      <Divider plain style={{ margin: "16px 0", color: "#888" }}>
        or continue with
      </Divider>
      <div className="grid grid-cols-2 gap-3">
        <Button
          block
          size="large"
          onClick={() => handleSocialLogin("google")}
          style={{
            border: "1px solid #e0e0e0",
            background: "#fff",
          }}
        >
          Google
        </Button>
        <Button
          block
          size="large"
          onClick={() => handleSocialLogin("line")}
          style={{
            background: "#00B900",
            borderColor: "#00B900",
            color: "#fff",
          }}
        >
          LINE
        </Button>
        <Button
          block
          size="large"
          onClick={() => handleSocialLogin("facebook")}
          style={{
            background: "#1877F2",
            borderColor: "#1877F2",
            color: "#fff",
          }}
        >
          Facebook
        </Button>
        <Button
          block
          size="large"
          onClick={() => handleSocialLogin("discord")}
          style={{
            background: "#5865F2",
            borderColor: "#5865F2",
            color: "#fff",
          }}
        >
          Discord
        </Button>
      </div>
    </div>
  );

  const items = [
    {
      key: "login",
      label: "Login",
      children: (
        <Form
          form={form}
          name="login_form"
          onFinish={handleLogin}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Log in
            </Button>
          </Form.Item>
          <SocialLoginButtons />
        </Form>
      ),
    },
    {
      key: "register",
      label: "Register",
      children: (
        <Form
          form={registerForm}
          name="register_form"
          onFinish={handleRegister}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item
              name="first_name"
              className="flex-1"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="First Name" />
            </Form.Item>
            <Form.Item
              name="last_name"
              className="flex-1"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Last Name" />
            </Form.Item>
          </div>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>
          <SocialLoginButtons />
        </Form>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      destroyOnHidden
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        centered
      />
    </Modal>
  );
}
