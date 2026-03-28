"use client";

import { useQuery } from "@tanstack/react-query";
import { Empty, Spin, Tag, Typography } from "antd";
import { getMyDisputes } from "@/services/dispute";
import type { Dispute } from "@/types/dispute";
import { formatDate } from "@/utils/format";

const { Text } = Typography;

const statusColor: Record<string, string> = {
  OPEN: "blue",
  UNDER_REVIEW: "orange",
  RESOLVED: "green",
  CLOSED: "default",
};

const statusLabel: Record<string, string> = {
  OPEN: "เปิดอยู่",
  UNDER_REVIEW: "กำลังตรวจสอบ",
  RESOLVED: "แก้ไขแล้ว",
  CLOSED: "ปิดแล้ว",
};

export default function DisputesList() {
  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["disputes", "me"],
    queryFn: getMyDisputes,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <Empty
        description="ยังไม่มีการร้องเรียน"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute: Dispute) => (
        <div
          key={dispute.dispute_id}
          className="border border-gray-100 p-4 space-y-3"
        >
          <div className="flex justify-between items-start">
            <div>
              <Text strong className="block">{dispute.reason}</Text>
              <Text type="secondary" className="text-xs">
                Order #{dispute.order_id.substring(0, 8)}
              </Text>
            </div>
            <Tag color={statusColor[dispute.status]}>
              {statusLabel[dispute.status] || dispute.status}
            </Tag>
          </div>
          {dispute.description && (
            <Text type="secondary" className="text-sm block">{dispute.description}</Text>
          )}
          {dispute.resolution && (
            <div className="bg-green-50 p-3 text-sm">
              <Text className="text-green-700">
                การแก้ไข: {dispute.resolution}
              </Text>
            </div>
          )}
          <Text type="secondary" className="text-xs block">
            {formatDate(dispute.created_at)}
          </Text>
        </div>
      ))}
    </div>
  );
}
