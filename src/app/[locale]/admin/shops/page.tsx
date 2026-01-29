"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Space, Card, Typography, message } from "antd";
import { getAdminShops, AdminShopListResponse } from "@/services/shop";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { EyeOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function AdminShopsPage() {
  const [shops, setShops] = useState<AdminShopListResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await getAdminShops();
      setShops(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch shops");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Shop Name",
      dataIndex: "shop_name",
      key: "shop_name",
      render: (text: string, record: AdminShopListResponse) => (
        <span className="font-medium">{text || record.shop_code}</span>
      ),
    },
    {
      title: "Owner",
      dataIndex: "owner_name",
      key: "owner_name",
    },
    {
      title: "Requested Date",
      dataIndex: "requested_date",
      key: "requested_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "approved") color = "success";
        if (status === "pending_approve") color = "warning";
        if (status === "suspended") color = "error";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: AdminShopListResponse) => (
        <Space size="middle">
          <Link href={`/admin/shops/${record.shop_id}`}>
            <Button type="primary" icon={<EyeOutlined />} size="small">
              View
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Title level={2} className="m-0">Shop Management</Title>
      </div>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={shops}
          rowKey="shop_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
