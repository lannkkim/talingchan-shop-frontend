"use client";

import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import { UserOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";

export default function AdminDashboardPage() {
  const t = useTranslations("Admin.Dashboard");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t("totalUsers")}
              value={12} // Todo: fetch real stats
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t("activeRoles")}
              value={5} // Todo: fetch real stats
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-8">
        <p className="text-gray-500">{t("welcome")}</p>
      </div>
    </div>
  );
}
