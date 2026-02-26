"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  Table,
  Space,
  Button,
  Select,
  Typography,
  App,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getAdminOrders, updateAdminOrderStatus, confirmPayment, rejectPayment } from "@/services/order";
import { Order } from "@/types/order";
import { OrderDetailsModal } from "@/app/[locale]/shop/OrderDetailsModal";
import type { TableProps } from "antd";
type ColumnsType<T> = TableProps<T>["columns"];
import { useTranslations } from "next-intl";
import { OrderStatusTag } from "@/components/Order/OrderStatusTag";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import { formatDate, formatCurrency } from "@/utils/format";

const { Text } = Typography;
const { Option } = Select;

export default function AdminOrdersPage() {
  const { message } = App.useApp();
  const ts = useTranslations("Shop.orders.status");

  const orderStatuses = [
    { value: "WVP", label: "รอตรวจสอบการชำระเงิน" },
    { value: "PD", label: "รออนุมัติ" },
    { value: "AP", label: "อนุมัติ" },
    { value: "RJ", label: "ไม่อนุมัติ" },
    { value: "WA", label: "รอจบการประมูล" },
    { value: "CPA", label: "ชนะการประมูล" },
    { value: "NCA", label: "ไม่ชนะการประมูล" },
    { value: "WO", label: "รอการเสนอขาย" },
    { value: "CC", label: "ยกเลิก" },
    { value: "RF", label: "ขอคืนเงิน" },
    { value: "WP", label: "รอแพ็คของ" },
    { value: "WS", label: "รอจัดส่ง" },
    { value: "RS", label: "จัดส่งแล้ว" },
    { value: "CP", label: "จัดส่งสำเร็จ" },
  ];

  // Helper to normalize legacy status codes to new ones for Select value
  const getNormalizedStatus = (status: string) => {
    const mapping: Record<string, string> = {
      "pending_approve": "WVP",
      "pending": "PD",
      "paid": "AP",
      "shipped": "RS",
      "completed": "CP",
      "cancelled": "CC"
    };
    return mapping[status] || status;
  };

  // State for filtering
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Fetch Orders
  const {
    data: allOrders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: getAdminOrders,
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateAdminOrderStatus(orderId, status),
    onSuccess: () => {
      message.success("อัปเดตสถานะสำเร็จ");
      refetch();
    },
    onError: () => {
      message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    },
  });

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  // Payment Actions Mutations
  const confirmPaymentMutation = useMutation({
    mutationFn: (orderId: string) => confirmPayment(orderId),
    onSuccess: () => {
      message.success("อนุมัติการชำระเงินสำเร็จ");
      refetch();
    },
    onError: () => {
      message.error("เกิดข้อผิดพลาดในการอนุมัติการชำระเงิน");
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: (orderId: string) => rejectPayment(orderId),
    onSuccess: () => {
      message.success("ปฏิเสธการชำระเงินสำเร็จ");
      refetch();
    },
    onError: () => {
      message.error("เกิดข้อผิดพลาดในการปฏิเสธการชำระเงิน");
    },
  });

  const handleConfirmPayment = (orderId: string) => {
    confirmPaymentMutation.mutate(orderId);
  };

  const handleRejectPayment = (orderId: string) => {
    rejectPaymentMutation.mutate(orderId);
  };

  // Filter and Sort Orders
  const displayOrders = useMemo(() => {
    let filtered = allOrders || [];
    
    // Apply Status Filter
    if (statusFilter) {
      filtered = filtered.filter(order => getNormalizedStatus(order.status) === statusFilter);
    }

    // Apply Sorting: pending_approve > created_at DESC
    return [...filtered].sort((a, b) => {
      const aIsPending = a.status === "pending_approve";
      const bIsPending = b.status === "pending_approve";

      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;

      // Secondary Sort: Newest First
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [allOrders, statusFilter]);

  const columns: ColumnsType<Order> = [
    {
      title: "รหัสออเดอร์",
      dataIndex: "order_id",
      key: "order_id",
      render: (text: string, record: Order) => (
        <Text strong>{record.order_code || record.order_id.substring(0, 8)}</Text>
      ),
      width: 120,
    },
    {
      title: "ร้านค้า",
      key: "shop",
      render: (_: any, record: Order) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {record.shop?.shop_profile?.shop_name || "ร้านค้าทั่วไป"}
          </span>
        </div>
      ),
    },
    {
      title: "ผู้ซื้อ",
      key: "buyer",
      render: (_: any, record: Order) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {record.buyer?.username || "-"}
          </span>
        </div>
      ),
    },
    {
      title: "ยอดคงเหลือสุทธิ",
      key: "total",
      align: "right",
      render: (_: any, record: Order) => (
        <Space orientation="vertical" size={0} align="end">
          <Text strong className="text-base text-green-600">
            {formatCurrency(record.total_price)}
          </Text>
          <Text type="secondary" className="text-[10px]">
            {record.order_quantity || 0} ชิ้น
          </Text>
        </Space>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string) => (
        <OrderStatusTag status={status} t={ts} />
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "วันที่สั่งซื้อ",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date, true),
    },
    {
      title: "การจัดการ",
      key: "action",
      align: "center",
      render: (_: any, record: Order) => (
        <Space>
          <Button
            type="text"
            size="small"
            className="text-[10px] px-2 h-7 flex flex-col items-center justify-center text-gray-500 hover:text-blue-500"
            onClick={() => handleView(record)}
            title="ดูรายละเอียด"
          >
            <EyeOutlined className="text-lg mb-1" />
            รายละเอียด
          </Button>
          {record.status === "pending_approve" ? (
            <div className="flex gap-2">
              <Button
                type="primary"
                size="small"
                className="bg-green-600 hover:!bg-green-700 text-[11px]"
                onClick={() => handleConfirmPayment(record.order_id)}
                loading={confirmPaymentMutation.isPending && selectedOrder?.order_id === record.order_id}
              >
                อนุมัติ
              </Button>
              <Button
                type="primary"
                danger
                size="small"
                className="text-[11px]"
                onClick={() => handleRejectPayment(record.order_id)}
                loading={rejectPaymentMutation.isPending && selectedOrder?.order_id === record.order_id}
              >
                ไม่อนุมัติ
              </Button>
            </div>
          ) : (
            <Select
              size="small"
              value={getNormalizedStatus(record.status)}
              onChange={(value) => handleStatusChange(record.order_id, value)}
              style={{ width: 140 }}
              className="text-[11px]"
              loading={updateStatusMutation.isPending && selectedOrder?.order_id === record.order_id}
              onClick={(e) => e.stopPropagation()}
            >
              {orderStatuses.map((s) => (
                <Option key={s.value} value={s.value}>
                  {ts(s.value) || s.label}
                </Option>
              ))}
            </Select>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ManagementPageLayout 
      title="รายการสั่งซื้อทั้งหมด (แอดมิน)"
      extra={
        <Space>
          <Select
            placeholder="ตัวกรองสถานะ"
            allowClear
            style={{ width: 200 }}
            onChange={setStatusFilter}
          >
            {orderStatuses.map((s) => (
              <Option key={s.value} value={s.value}>
                {ts(s.value) || s.label}
              </Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            โหลดข้อมูลใหม่
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={displayOrders}
        rowKey="order_id"
        loading={isLoading}
        pagination={{ pageSize: 15, showSizeChanger: true }}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </ManagementPageLayout>
  );
}
