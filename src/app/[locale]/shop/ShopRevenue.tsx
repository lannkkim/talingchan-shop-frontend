"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Typography, Row, Col, Statistic, Skeleton } from "antd";
import { WalletOutlined, PercentageOutlined, BankOutlined, HistoryOutlined } from "@ant-design/icons";
import { getShopRevenueDashboard } from "@/services/shop";
import { ShopRevenueDashboardResponse } from "@/types/revenue";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import { formatDate, formatCurrency } from "@/utils/format";
import { useTranslations } from "next-intl";

const { Text } = Typography;

export default function ShopRevenue() {
  const t = useTranslations("Shop.revenue");
  
  const { data, isLoading } = useQuery<ShopRevenueDashboardResponse>({
    queryKey: ["shop", "revenue"],
    queryFn: getShopRevenueDashboard,
  });

  const columns = [
    {
      title: t("table.date"),
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date, true),
    },
    {
      title: t("table.orderCode"),
      dataIndex: "order_code",
      key: "order_code",
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: t("table.totalAmount"),
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right" as const,
      render: (val: string) => formatCurrency(val),
    },
    {
      title: t("table.feeAmount"),
      dataIndex: "fee_amount",
      key: "fee_amount",
      align: "right" as const,
      render: (val: string, record: any) => (
        <div className="flex flex-col items-end">
          <Text type="danger">-{formatCurrency(val)}</Text>
          <Text type="secondary" className="text-[10px]">({(Number(record.fee_rate) * 100).toFixed(1)}%)</Text>
        </div>
      ),
    },
    {
      title: t("table.netRevenue"),
      dataIndex: "net_revenue",
      key: "net_revenue",
      align: "right" as const,
      render: (val: string) => (
        <Text strong className="text-green-600">
          {formatCurrency(val)}
        </Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <ManagementPageLayout title={t("title")}>
        <Row gutter={16} className="mb-8">
          {[1, 2, 3].map((i) => (
            <Col span={8} key={i}>
              <Card variant="borderless">
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Card variant="borderless">
          <Skeleton active />
        </Card>
      </ManagementPageLayout>
    );
  }

  const summary = data?.summary;

  return (
    <ManagementPageLayout title={t("title")}>
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title={t("summary.totalRevenue")}
              value={summary?.total_revenue}
              precision={2}
              prefix={<WalletOutlined className="text-blue-500 mr-2" />}
              formatter={(value) => formatCurrency(value as string)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title={t("summary.totalFee")}
              value={summary?.total_fee}
              precision={2}
              prefix={<PercentageOutlined className="text-red-500 mr-2" />}
              formatter={(value) => `-${formatCurrency(value as string)}`}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className="shadow-sm bg-blue-50/30">
            <Statistic
              title={t("summary.netRevenue")}
              value={summary?.net_revenue}
              precision={2}
              prefix={<BankOutlined className="text-green-500 mr-2" />}
              formatter={(value) => formatCurrency(value as string)}
              styles={{ content: { color: '#3f8600', fontWeight: 'bold' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined />
            <span>{t("table.title")}</span>
          </div>
        }
        variant="borderless"
        className="shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={data?.revenues}
          rowKey="revenue_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </ManagementPageLayout>
  );
}
