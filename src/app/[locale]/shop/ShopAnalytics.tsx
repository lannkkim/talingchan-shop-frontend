"use client";

import React from "react";
import { Card, Row, Col, Statistic, Skeleton, Rate } from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getShopAnalytics } from "@/services/shop";
import { formatCurrency } from "@/utils/format";

export default function ShopAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["shop-analytics"],
    queryFn: getShopAnalytics,
  });

  if (isLoading) return <Skeleton active />;

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="คำสั่งซื้อทั้งหมด"
              value={data?.total_orders ?? 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="รอดำเนินการ"
              value={data?.pending_orders ?? 0}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="เสร็จสิ้น"
              value={data?.completed_orders ?? 0}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="ยกเลิก/คืนเงิน"
              value={data?.cancelled_orders ?? 0}
              prefix={<CloseCircleOutlined />}
              styles={{ content: { color: "#ff4d4f" } }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="ยอดขายรวม"
              value={formatCurrency(data?.total_revenue ?? 0)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="คะแนนเฉลี่ย"
              value={(data?.avg_rating ?? 0).toFixed(1)}
              prefix={<StarOutlined />}
              suffix={`/ 5 (${data?.total_reviews ?? 0} รีวิว)`}
              styles={{ content: { color: "#faad14" } }}
            />
            <Rate disabled allowHalf value={data?.avg_rating ?? 0} className="text-sm mt-1" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
