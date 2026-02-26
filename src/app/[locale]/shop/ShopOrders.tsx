"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Space,
  Typography,
  App,
  Tooltip,
  Select,
  Alert,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getShopOrders, shipOrder, getTransportations } from "@/services/order";
import { Order, OrderProduct } from "@/types/order";
import { OrderStatusTag } from "@/components/Order/OrderStatusTag";
import { OrderDetailsModal } from "./OrderDetailsModal";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];
import { useTranslations } from "next-intl";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import { formatDate, formatCurrency } from "@/utils/format";
import Image from "next/image";
import { getProductImage } from "@/utils/image";

const { Text } = Typography;

export default function ShopOrders() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const t = useTranslations("Shop.orders");
  const ts = useTranslations("Shop.orders.status");

  // State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [transportationId, setTransportationId] = useState<string | undefined>(undefined);

  // Queries
  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["shop", "orders"],
    queryFn: getShopOrders,
  });

  const { data: transportations = [], isLoading: isTransportationsLoading } = useQuery({
    queryKey: ["transportations"],
    queryFn: getTransportations,
  });

  // Mutations
  const shipMutation = useMutation({
    mutationFn: ({ orderId, tracking, transportId }: { orderId: string; tracking: string, transportId: string }) =>
      shipOrder(orderId, tracking, transportId),
    onSuccess: () => {
      message.success(t("tracking.success") || "Order marked as shipped successfully");
      setIsTrackingOpen(false);
      queryClient.invalidateQueries({ queryKey: ["shop", "orders"] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || t("tracking.error") || "Failed to mark as shipped");
    },
  });

  // Handlers
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleEditTracking = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.tracking_no || "");
    setTransportationId(order.transportation?.transportation_id || undefined);
    setIsTrackingOpen(true);
  };

  const handleSaveTracking = () => {
    if (!selectedOrder) return;
    if (!trackingNumber || !transportationId) {
      message.error(t("tracking.validationError") || "Please enter both tracking number and transportation");
      return;
    }
    shipMutation.mutate({
      orderId: selectedOrder.order_id,
      tracking: trackingNumber,
      transportId: transportationId,
    });
  };

  const columns: ColumnsType<Order> = [
    {
      title: t("columns.orderId") || "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      render: (text: string, record: Order) => (
        <Text strong>{record.order_code || text.substring(0, 8)}</Text>
      ),
    },
    {
      title: t("columns.buyer") || "Buyer",
      key: "buyer",
      render: (_: any, record: Order) => (
        <div className="flex flex-col">
          <Text className="text-sm font-medium">{record.buyer?.username || "-"}</Text>
          <Text type="secondary" className="text-xs">{record.buyer?.email}</Text>
        </div>
      ),
    },
    {
      title: t("columns.items") || "Items",
      key: "items",
      render: (_: any, record: Order) => (
        <div className="flex -space-x-2 overflow-hidden py-1">
          {record.order_product?.map((item: OrderProduct, idx: number) => (
            <Tooltip
              key={item.order_product_id}
              title={`${item.product?.name} x ${item.quantity}`}
            >
              <div 
                className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-gray-50 flex-shrink-0"
                style={{ zIndex: 10 - idx }}
              >
                <Image
                  src={getProductImage(item.product)}
                  alt={item.product?.name || "Product"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </Tooltip>
          ))}
        </div>
      ),
    },
    {
      title: t("columns.total") || "Total",
      dataIndex: "total_price",
      key: "total_price",
      align: "right",
      render: (price: string) => (
        <Text strong className="text-green-600">
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: t("columns.status") || "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <OrderStatusTag status={status} t={ts} />,
    },
    {
      title: t("columns.date") || "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date, true),
    },
    {
      title: t("columns.tracking") || "Tracking",
      dataIndex: "tracking_no",
      key: "tracking_no",
      render: (val: string) => val || <Text type="secondary" italic>{t("tracking.notSet") || "Not Set"}</Text>,
    },
    {
      title: t("columns.actions") || "Actions",
      key: "actions",
      align: "center",
      render: (_: any, record: Order) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            {t("actions.view") || "View"}
          </Button>
          {!["pending_approve", "WVP", "pending", "PD", "cancelled", "CC", "RJ", "RF"].includes(record.status) && (
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditTracking(record)}
            >
              {t("actions.tracking") || "Tracking"}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ManagementPageLayout 
      title={t("title") || "Shop Orders"}
      extra={
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
          {t("actions.refresh") || "Refresh"}
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="order_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <Modal
        title={t("tracking.modalTitle") || "Update Tracking"}
        open={isTrackingOpen}
        onOk={handleSaveTracking}
        onCancel={() => setIsTrackingOpen(false)}
        confirmLoading={shipMutation.isPending}
      >
        <div className="py-4 space-y-4">
          <div>
            <Text className="mb-2 block">{t("tracking.transportation") || "Transportation Method"}</Text>
            <Select
              className="w-full"
              placeholder={t("tracking.selectTransportation") || "Select transportation method"}
              options={transportations.map((t) => ({ label: t.transportation_name || t.name, value: t.transportation_id }))}
              value={transportationId}
              onChange={setTransportationId}
              loading={isTransportationsLoading}
            />
          </div>
          <div>
            <Text className="mb-2 block">{t("tracking.label") || "Tracking Number"}</Text>
            <Input
              placeholder={t("tracking.placeholder") || "Enter tracking number"}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              prefix={<CarOutlined className="text-gray-400" />}
            />
          </div>
        </div>
      </Modal>
    </ManagementPageLayout>
  );
}
