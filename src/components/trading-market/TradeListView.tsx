"use client";

import { Table, Tag, Typography, Space, Button, App } from "antd";
import { TradeList } from "@/services/tradeList";
import { useTranslations } from "next-intl";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTradeList } from "@/services/tradeList";

const { Text } = Typography;

interface TradeListViewProps {
  tradeLists: TradeList[];
}

export default function TradeListView({ tradeLists }: TradeListViewProps) {
  const t = useTranslations("TradingMarket");
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteTradeList,
    onSuccess: () => {
      message.success(t("messages.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["trade-lists"] });
    },
    onError: (error: any) => {
      message.error(t("messages.error", { error: error.message }));
    },
  });

  const handleDelete = (id: number) => {
    modal.confirm({
      title: t("confirm.deleteTitle"),
      content: t("confirm.deleteContent"),
      okText: t("confirm.delete"),
      okType: "danger",
      cancelText: t("confirm.cancel"),
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const columns = [
    {
      title: t("table.id"),
      dataIndex: "transaction_id",
      key: "transaction_id",
      width: 80,
    },
    {
      title: t("table.tradeProduct"),
      dataIndex: "trade_product",
      key: "trade_product",
      render: (product: any) => (
        <div>
          <Text strong>{product?.name || "-"}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            ID: {product?.product_id || "-"}
          </Text>
        </div>
      ),
    },
    {
      title: t("table.wishProduct"),
      dataIndex: "wish_product",
      key: "wish_product",
      render: (product: any) => (
        <div>
          <Text strong>{product?.name || "-"}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            ID: {product?.product_id || "-"}
          </Text>
        </div>
      ),
    },
    {
      title: t("table.cashExtra"),
      dataIndex: "cash",
      key: "cash",
      width: 120,
      render: (cash: number) => (
        <Tag color={cash > 0 ? "green" : "default"}>
          ฿{cash.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: t("table.createdAt"),
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date: string) => (
        <Text type="secondary">
          {date ? new Date(date).toLocaleDateString("th-TH") : "-"}
        </Text>
      ),
    },
    {
      title: t("table.actions"),
      key: "actions",
      width: 120,
      render: (_: any, record: TradeList) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.transaction_id)}
            loading={deleteMutation.isPending}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="mt-4">
      <Table
        columns={columns}
        dataSource={tradeLists}
        rowKey="transaction_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => t("table.total", { total }),
        }}
        locale={{
          emptyText: t("table.noData"),
        }}
      />
    </div>
  );
}
