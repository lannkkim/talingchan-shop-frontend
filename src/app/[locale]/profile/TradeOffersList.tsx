"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Tag, Button, Typography, Empty, Modal, Space } from "antd";
import { SwapOutlined, FileTextOutlined } from "@ant-design/icons";
import type { TradingOffer } from "@/types/trading";
import { getMyOffers, cancelOffer } from "@/services/trading";
import { formatDate } from "@/utils/format";
import { Link } from "@/navigation";

const { Text } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING: { color: "orange", label: "รอการตอบรับ" },
  ACCEPTED: { color: "success", label: "ได้รับการยอมรับ" },
  REJECTED: { color: "error", label: "ถูกปฏิเสธ" },
  WITHDRAWN: { color: "default", label: "ถอนข้อเสนอแล้ว" },
  EXPIRED: { color: "default", label: "หมดอายุ" },
};

export default function TradeOffersList() {
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["trading", "my-offers"],
    queryFn: getMyOffers,
    select: (data) => data ?? [],
  });

  const { mutate: withdraw, isPending: isWithdrawing } = useMutation({
    mutationFn: cancelOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading", "my-offers"] });
    },
  });

  const handleWithdraw = (offer: TradingOffer) => {
    Modal.confirm({
      title: "ถอนข้อเสนอ",
      content: `ต้องการถอนข้อเสนอสำหรับ "${offer.product_name ?? offer.product_id}" ใช่ไหม?`,
      okText: "ถอนข้อเสนอ",
      okButtonProps: { danger: true },
      cancelText: "ยกเลิก",
      onOk: () => withdraw(offer.offer_id),
    });
  };

  const columns = [
    {
      title: "สินค้า",
      key: "product",
      render: (_: unknown, record: TradingOffer) => (
        <div>
          <Text strong className="block">{record.product_name ?? record.product_id}</Text>
          <Text type="secondary" className="text-xs">
            {record.offer_type === "TRADE" ? "Trade" : "Buy Order"}
          </Text>
        </div>
      ),
    },
    {
      title: "รายการที่เสนอ",
      key: "items",
      render: (_: unknown, record: TradingOffer) => (
        <div className="space-y-0.5">
          <Text className="text-sm">{record.items.length} รายการ</Text>
          {record.additional_cash && (
            <Text type="secondary" className="text-xs block">+ ฿{Number(record.additional_cash).toLocaleString()}</Text>
          )}
          {record.message && (
            <Text type="secondary" className="text-xs block italic">"{record.message}"</Text>
          )}
        </div>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const s = STATUS_MAP[status] ?? { color: "default", label: status };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: "วันที่ส่ง",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => <Text className="text-sm">{formatDate(v, true)}</Text>,
    },
    {
      title: "",
      key: "actions",
      render: (_: unknown, record: TradingOffer) => (
        <div className="flex gap-2 justify-end">
          {record.trade_execution_id && (
            <Link href={`/profile?tab=trade-executions&id=${record.trade_execution_id}`}>
              <Button size="small" icon={<SwapOutlined />}>
                ดูการแลกเปลี่ยน
              </Button>
            </Link>
          )}
          {record.order_id && (
            <Link href="/profile?tab=purchases">
              <Button size="small" icon={<FileTextOutlined />}>
                ดูออเดอร์
              </Button>
            </Link>
          )}
          {record.status === "PENDING" && (
            <Button
              size="small"
              danger
              loading={isWithdrawing}
              onClick={() => handleWithdraw(record)}
            >
              ถอนข้อเสนอ
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (!isLoading && offers.length === 0) {
    return (
      <Empty
        image={<SwapOutlined className="text-5xl text-gray-300" />}
        description="คุณยังไม่มีข้อเสนอแลกเปลี่ยน"
        imageStyle={{ height: 64 }}
      >
        <Space direction="vertical" align="center">
          <Text type="secondary" className="text-sm">ไปที่ตลาดแลกเปลี่ยนเพื่อส่งข้อเสนอ</Text>
        </Space>
      </Empty>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={offers}
      rowKey="offer_id"
      loading={isLoading}
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
      size="middle"
    />
  );
}
