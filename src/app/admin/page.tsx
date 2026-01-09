"use client";

import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import { UserOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={12} // Todo: fetch real stats
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Roles"
              value={5} // Todo: fetch real stats
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-8">
          <p className="text-gray-500">Welcome to the Admin Control Panel. Use the sidebar to manage users and roles.</p>
      </div>
    </div>
  );
}
