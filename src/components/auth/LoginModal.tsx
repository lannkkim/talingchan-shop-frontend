"use client";

import React, { useState } from "react";
import { Modal, Tabs, Form, Input, Button, App } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from "@ant-design/icons";
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
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Log in
            </Button>
          </Form.Item>
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
                    { type: 'email', message: "Please enter a valid email!" }
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
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                    Register
                </Button>
            </Form.Item>
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
