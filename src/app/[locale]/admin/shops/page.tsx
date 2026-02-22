"use client";

import React from "react";
import { Table, Button, Space, App } from "antd";
import { getAdminShops, AdminShopListResponse } from "@/services/shop";
import { Link } from "@/navigation";
import { EyeOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import { StatusTag } from "@/components/shared/StatusTag";
import { formatDate } from "@/utils/format";
import { useTranslations } from "next-intl";

export default function AdminShopsPage() {
  const t = useTranslations("Admin.Shops");

  const { data: shops = [], isLoading } = useQuery<AdminShopListResponse[]>({
    queryKey: ["admin", "shops"],
    queryFn: getAdminShops,
    meta: {
      errorMessage: t("messages.fetchError"),
    },
  });

  const columns = [
    {
      title: t("columns.name"),
      dataIndex: "shop_name",
      key: "shop_name",
      render: (text: string, record: AdminShopListResponse) => (
        <span className="font-medium">{text || record.shop_code}</span>
      ),
    },
    {
      title: t("columns.owner"),
      dataIndex: "owner_name",
      key: "owner_name",
    },
    {
      title: t("columns.requestedDate"),
      dataIndex: "requested_date",
      key: "requested_date",
      render: (date: string) => formatDate(date),
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <StatusTag domain="shop" status={status} />
      ),
    },
    {
      title: t("columns.action"),
      key: "action",
      render: (_: any, record: AdminShopListResponse) => (
        <Space size="middle">
          <Link href={`/admin/shops/${record.shop_id}`}>
            <Button type="primary" icon={<EyeOutlined />} size="small">
              {t("actions.view")}
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <ManagementPageLayout title={t("title")}>
      <Table
        columns={columns}
        dataSource={shops}
        rowKey="shop_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
    </ManagementPageLayout>
  );
}
