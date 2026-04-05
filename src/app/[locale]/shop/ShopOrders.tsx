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
  FileTextOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getShopOrders, shipOrder, getTransportations, cancelOrder, approveCancel, rejectCancel, reviewRefund, confirmReturn, bulkShipOrders } from "@/services/order";
import BulkImportModal from "@/components/shared/BulkImportModal";
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
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const t = useTranslations("Shop.orders");
  const ts = useTranslations("Shop.orders.status");

  // State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isBulkShipOpen, setIsBulkShipOpen] = useState(false);
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

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string, reason: string }) => cancelOrder(orderId, reason),
    onSuccess: () => {
      message.success(t("messages.cancelSuccess") || "ยกเลิกคำสั่งซื้อสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["shop", "orders"] });
    },
  });

  const approveCancelMutation = useMutation({
    mutationFn: (orderId: string) => approveCancel(orderId),
    onSuccess: () => {
      message.success(t("messages.approveCancelSuccess") || "อนุมัติยกเลิกสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["shop", "orders"] });
    },
  });

  const rejectCancelMutation = useMutation({
    mutationFn: ({ orderId, tracking, transportId }: { orderId: string; tracking: string, transportId: string }) =>
      rejectCancel(orderId, tracking, transportId),
    onSuccess: () => {
      message.success("ปฏิเสธการยกเลิกและจัดส่งสินค้าเรียบร้อย");
      setIsTrackingOpen(false);
      queryClient.invalidateQueries({ queryKey: ["shop", "orders"] });
    },
  });

  const reviewRefundMutation = useMutation({
    mutationFn: ({ orderId, action, reason }: { orderId: string, action: string, reason?: string }) => 
      reviewRefund(orderId, action, reason),
    onSuccess: () => {
      message.success("ประมวลผลคำขอสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["shop", "orders"] });
    },
  });

  const confirmReturnMutation = useMutation({
    mutationFn: (orderId: string) => confirmReturn(orderId),
    onSuccess: () => {
      message.success("ยืนยันรับของคืนและคืนเงินสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["shop", "orders"] });
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

    if (selectedOrder.status === "CC_REQ") {
      rejectCancelMutation.mutate({
        orderId: selectedOrder.order_id,
        tracking: trackingNumber,
        transportId: transportationId,
      });
    } else {
      shipMutation.mutate({
        orderId: selectedOrder.order_id,
        tracking: trackingNumber,
        transportId: transportationId,
      });
    }
  };

  const handleShopCancel = (order: Order) => {
    let reason = "";
    modal.confirm({
      title: "ยกเลิกคำสั่งซื้อ",
      content: (
        <div className="mt-4">
          <Text type="secondary">กรุณาระบุเหตุผลที่ยกเลิก:</Text>
          <Input.TextArea 
            className="mt-2" 
            placeholder="เช่น สินค้าหมด"
            onChange={(e) => reason = e.target.value}
          />
        </div>
      ),
      onOk: async () => {
        if (!reason.trim()) {
          message.warning("กรุณาระบุเหตุผล");
          return Promise.reject();
        }
        await cancelMutation.mutateAsync({ orderId: order.order_id, reason });
      },
    });
  };

  const handleReviewRefund = (order: Order) => {
    let reason = "";
    modal.confirm({
      title: "พิจารณาคำขอคืนเงิน",
      width: 600,
      content: (
        <div className="mt-4 space-y-4">
          <Alert title={`เหตุผลจากผู้ซื้อ: ${order.refund_reason}`} type="info" />
          {order.refund_images && order.refund_images.length > 0 && (
            <div className="bg-gray-50 p-4 rounded border border-gray-100">
              <Text strong className="block mb-2 text-xs uppercase tracking-wider text-gray-500">หลักฐานที่แนบมา:</Text>
              <div className="flex flex-wrap gap-2">
                {order.refund_images.map((img, i) => (
                  <div key={i} className="relative w-24 h-24 border rounded overflow-hidden bg-white shadow-sm">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/images/refunds/${img}`}
                      alt={`Evidence ${i + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/images/refunds/${img}`, "_blank")}
                    />
                  </div>
                ))}
              </div>
              <Text type="secondary" className="text-[10px] mt-2 block">คลิกที่รูปเพื่อดูขนาดใหญ่</Text>
            </div>
          )}
          <Text type="secondary">โปรดเลือกดำเนินการ:</Text>
        </div>
      ),
      footer: (
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button danger onClick={() => {
            modal.confirm({
              title: "ยืนยันการปฏิเสธ",
              content: <Input.TextArea placeholder="ระบุเหตุผลที่ปฏิเสธ" onChange={e => reason = e.target.value} />,
              onOk: () => reviewRefundMutation.mutateAsync({ orderId: order.order_id, action: "REJECT", reason })
            });
            Modal.destroyAll();
          }}>ปฏิเสธ</Button>
          <Button onClick={() => reviewRefundMutation.mutate({ orderId: order.order_id, action: "APPROVE_RETURN" })}>อนุมัติให้ส่งคืนสินค้า</Button>
          <Button type="primary" onClick={() => reviewRefundMutation.mutate({ orderId: order.order_id, action: "APPROVE_REFUND" })}>คืนเงินทันที</Button>
        </div>
      )
    });
  };

  const columns: ColumnsType<Order> = [
    {
      title: t("columns.orderId") || "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      width: 100,
      render: (text: string, record: Order) => (
        <Text strong className="text-sm">{record.order_code || text.substring(0, 8)}</Text>
      ),
    },
    {
      title: t("columns.buyer") || "Buyer",
      key: "buyer",
      width: 130,
      render: (_: any, record: Order) => (
        <Tooltip title={record.buyer?.email}>
          <Text className="text-sm">{record.buyer?.username || "-"}</Text>
        </Tooltip>
      ),
    },
    {
      title: t("columns.items") || "Items",
      key: "items",
      width: 220,
      render: (_: any, record: Order) => (
        <div className="flex flex-col gap-1.5 py-1">
          {record.order_product?.slice(0, 2).map((item: OrderProduct) => (
            <div key={item.order_product_id} className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 shadow-sm">
                <Image
                  src={getProductImage(item.product)}
                  alt={item.product?.name || "Product"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <Text className="text-xs block truncate" style={{ maxWidth: 140 }}>
                  {item.product?.name}
                </Text>
                <Text type="secondary" className="text-[11px]">x{item.quantity}</Text>
              </div>
            </div>
          ))}
          {(record.order_product?.length || 0) > 2 && (
            <Text type="secondary" className="text-[11px]">
              +{record.order_product!.length - 2} รายการ
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t("columns.total") || "Total",
      dataIndex: "total_price",
      key: "total_price",
      align: "right",
      width: 110,
      render: (price: string) => (
        <Text strong className="text-green-600">{formatCurrency(price)}</Text>
      ),
    },
    {
      title: t("columns.status") || "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => <OrderStatusTag status={status} t={ts} />,
    },
    {
      title: t("columns.date") || "Date",
      dataIndex: "created_at",
      key: "created_at",
      width: 100,
      render: (date: string) => <Text className="text-xs whitespace-nowrap">{formatDate(date)}</Text>,
    },
    {
      title: t("columns.tracking") || "Tracking",
      dataIndex: "tracking_no",
      key: "tracking_no",
      width: 130,
      render: (val: string) => (
        <Text className="text-xs">{val || <span className="text-gray-400 italic">{t("tracking.notSet") || "ยังไม่ระบุ"}</span>}</Text>
      ),
    },
    {
      title: t("columns.actions") || "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 160,
      render: (_: any, record: Order) => (
        <Space size={4}>
          <Tooltip title={t("actions.view") || "ดูรายละเอียด"}>
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>

          {record.payment_slip && (
            <Tooltip title={t("slip.view") || "ดูสลิป"}>
              <Button
                icon={<FileTextOutlined />}
                size="small"
                className="text-blue-500"
                onClick={() => {
                  modal.info({
                    title: t("modals.slip.view") || "หลักฐานการชำระเงิน",
                    width: 450,
                    content: (
                      <div className="mt-4 flex justify-center bg-gray-50 p-4 border rounded">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/images/slips/${record.payment_slip}`}
                          alt="Slip"
                          className="max-w-full h-auto shadow-md"
                        />
                      </div>
                    ),
                    footer: null,
                    closable: true,
                    maskClosable: true,
                  });
                }}
              />
            </Tooltip>
          )}

          {record.status === "WS" && (
            <Tooltip title={t("actions.tracking") || "จัดส่ง"}>
              <Button
                icon={<CarOutlined />}
                size="small"
                type="primary"
                onClick={() => handleEditTracking(record)}
              />
            </Tooltip>
          )}

          {(record.status === "pending_approve" || record.status === "WS") && (
            <Button danger size="small" onClick={() => handleShopCancel(record)}>
              {t("actions.cancel") || "ยกเลิก"}
            </Button>
          )}

          {record.status === "CC_REQ" && (
            <>
              <Button
                type="primary"
                size="small"
                className="bg-green-600 hover:!bg-green-700"
                onClick={() => approveCancelMutation.mutate(record.order_id)}
              >
                {t("actions.approveCancel") || "อนุมัติ"}
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => handleEditTracking(record)}
              >
                {t("actions.rejectCancel") || "ปฏิเสธ"}
              </Button>
            </>
          )}

          {record.status === "RF_REQ" && (
            <Button type="primary" size="small" onClick={() => handleReviewRefund(record)}>
              {t("actions.reviewRefund") || "คืนเงิน"}
            </Button>
          )}

          {record.status === "WAITING_FOR_RETURN" && (
            <Button
              type="primary"
              size="small"
              className="bg-green-600 hover:!bg-green-700"
              onClick={() => confirmReturnMutation.mutate(record.order_id)}
              disabled={!record.return_tracking_no}
            >
              {record.return_tracking_no ? t("actions.receivedReturn") || "รับคืน" : t("actions.waitingReturn") || "รอคืน"}
            </Button>
          )}

          {!["pending_approve", "WS", "CC_REQ", "RF_REQ", "WAITING_FOR_RETURN", "WVP", "pending", "PD", "cancelled", "CC", "RJ", "RF"].includes(record.status) && (
            <Tooltip title={t("actions.tracking") || "Tracking"}>
              <Button icon={<EditOutlined />} size="small" onClick={() => handleEditTracking(record)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ManagementPageLayout 
      title={t("title") || "Shop Orders"}
      extra={
        <Space>
          <Button icon={<FileTextOutlined />} onClick={() => setIsBulkShipOpen(true)}>
            จัดส่งแบบกลุ่ม CSV
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            {t("actions.refresh") || "Refresh"}
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="order_id"
        loading={isLoading}
        size="small"
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <BulkImportModal
        open={isBulkShipOpen}
        onClose={() => { setIsBulkShipOpen(false); queryClient.invalidateQueries({ queryKey: ["shop", "orders"] }); }}
        onImport={async (file) => {
          const res = await bulkShipOrders(file);
          return { imported: res.shipped, errors: res.errors?.map((e) => ({ row: 0, message: `[${e.order_id}] ${e.message}` })) };
        }}
        title="จัดส่งแบบกลุ่มจาก CSV"
        csvDescription="CSV header: order_id,tracking_no,transportation_id"
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
