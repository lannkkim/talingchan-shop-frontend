"use client";

import React from "react";
import { Card, Statistic, Row, Col, Skeleton } from "antd";
import {
  UserOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import { formatCurrency } from "@/utils/format";

export default function AdminDashboardPage() {
  const t = useTranslations("Admin.Dashboard");

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminService.getDashboard,
  });

  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: adminService.getRevenueSummary,
  });

  if (isLoading || revLoading) return <Skeleton active />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title={t("totalUsers")}
              value={dashboard?.total_users ?? 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="ร้านค้าทั้งหมด"
              value={dashboard?.total_shops ?? 0}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="คำสั่งซื้อทั้งหมด"
              value={dashboard?.total_orders ?? 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="GMV รวม"
              value={formatCurrency(dashboard?.total_gmv ?? 0)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="รอดำเนินการ"
              value={dashboard?.pending_orders ?? 0}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="เสร็จสิ้น"
              value={dashboard?.completed_orders ?? 0}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="ค่าธรรมเนียมรวม"
              value={formatCurrency(revenue?.total_fees ?? 0)}
              styles={{ content: { color: "#1677ff" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="จ่ายออกรวม"
              value={formatCurrency(revenue?.total_payouts ?? 0)}
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
