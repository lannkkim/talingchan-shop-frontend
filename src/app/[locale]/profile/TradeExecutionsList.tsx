"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table, Tag, Button, Typography, Empty, Modal, Space, Input, Descriptions, Divider
} from "antd";
import { SwapOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { TradeExecution } from "@/types/trading";
import {
  getMyTradeExecutions,
  submitTrackingNumber,
  confirmTradeReceipt,
  cancelTradeExecution,
} from "@/services/trading";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/utils/format";

const { Text } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  AGREED: { color: "blue", label: "ตกลงแล้ว รอจัดส่ง" },
  SHIPPING: { color: "processing", label: "กำลังจัดส่ง" },
  COMPLETED: { color: "success", label: "เสร็จสมบูรณ์" },
  CANCELLED: { color: "error", label: "ยกเลิกแล้ว" },
};

function ExecutionDetail({ exec, myUserID, onClose }: {
  exec: TradeExecution;
  myUserID: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [trackingInput, setTrackingInput] = useState("");

  const isPartyA = exec.party_a_user_id === myUserID;
  const myTracking = isPartyA ? exec.party_a_tracking : exec.party_b_tracking;
  const myConfirmed = isPartyA ? exec.party_a_confirmed : exec.party_b_confirmed;
  const otherTracking = isPartyA ? exec.party_b_tracking : exec.party_a_tracking;
  const otherConfirmed = isPartyA ? exec.party_b_confirmed : exec.party_a_confirmed;

  const { mutate: submitTracking, isPending: isSubmittingTracking } = useMutation({
    mutationFn: (tracking: string) => submitTrackingNumber(exec.trade_execution_id, tracking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading", "executions"] });
      setTrackingInput("");
    },
  });

  const { mutate: confirm, isPending: isConfirming } = useMutation({
    mutationFn: () => confirmTradeReceipt(exec.trade_execution_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading", "executions"] });
    },
  });

  const { mutate: cancel, isPending: isCancelling } = useMutation({
    mutationFn: (reason: string) => cancelTradeExecution(exec.trade_execution_id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading", "executions"] });
      onClose();
    },
  });

  const handleCancel = () => {
    Modal.confirm({
      title: "ยกเลิกการแลกเปลี่ยน",
      content: (
        <div>
          <p className="mb-2">กรุณาระบุเหตุผลในการยกเลิก:</p>
          <Input
            id="cancel-reason-input"
            placeholder="เหตุผล..."
          />
        </div>
      ),
      okText: "ยืนยันการยกเลิก",
      okButtonProps: { danger: true },
      cancelText: "ยกเลิก",
      onOk: () => {
        const el = document.getElementById("cancel-reason-input") as HTMLInputElement;
        const reason = el?.value || "ยกเลิกโดยผู้ใช้";
        cancel(reason);
      },
    });
  };

  const canAct = exec.status !== "COMPLETED" && exec.status !== "CANCELLED";

  return (
    <div className="space-y-4">
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="สถานะ">
          <Tag color={STATUS_MAP[exec.status]?.color}>{STATUS_MAP[exec.status]?.label ?? exec.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="บทบาทของคุณ">
          {isPartyA ? "ผู้ขายสินค้า (Party A)" : "ผู้เสนอแลก (Party B)"}
        </Descriptions.Item>
        <Descriptions.Item label="คู่ค้า">
          <Text>{isPartyA ? exec.party_b_username : exec.party_a_username}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="วันที่ตกลง">
          {formatDate(exec.created_at, true)}
        </Descriptions.Item>
        {exec.completed_at && (
          <Descriptions.Item label="วันที่เสร็จ">
            {formatDate(exec.completed_at, true)}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider>การจัดส่ง</Divider>

      <div className="grid grid-cols-2 gap-4">
        {/* My side */}
        <div className="p-3 border rounded-lg">
          <Text strong className="block mb-2">ฝั่งคุณ</Text>
          {myTracking ? (
            <>
              <Text className="text-sm block">เลขพัสดุ: <Text code>{myTracking}</Text></Text>
              {(isPartyA ? exec.party_a_shipped_at : exec.party_b_shipped_at) && (
                <Text type="secondary" className="text-xs block">
                  ส่งเมื่อ {formatDate((isPartyA ? exec.party_a_shipped_at : exec.party_b_shipped_at)!, true)}
                </Text>
              )}
              {myConfirmed ? (
                <Tag color="success" className="mt-1">ยืนยันรับแล้ว ✓</Tag>
              ) : canAct && (
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={isConfirming}
                  className="mt-2"
                  onClick={() => {
                    Modal.confirm({
                      title: "ยืนยันการรับสินค้า",
                      content: "คุณได้รับสินค้าจากคู่ค้าแล้วใช่ไหม?",
                      okText: "ยืนยัน",
                      cancelText: "ยังไม่ได้รับ",
                      onOk: () => confirm(),
                    });
                  }}
                >
                  ยืนยันรับสินค้า
                </Button>
              )}
            </>
          ) : canAct ? (
            <Space.Compact className="w-full mt-1">
              <Input
                size="small"
                placeholder="เลขพัสดุ..."
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
              />
              <Button
                size="small"
                type="primary"
                loading={isSubmittingTracking}
                disabled={!trackingInput.trim()}
                onClick={() => submitTracking(trackingInput.trim())}
              >
                ส่ง
              </Button>
            </Space.Compact>
          ) : (
            <Text type="secondary" className="text-sm">ยังไม่ส่ง</Text>
          )}
        </div>

        {/* Other party */}
        <div className="p-3 border rounded-lg">
          <Text strong className="block mb-2">ฝั่งคู่ค้า</Text>
          {otherTracking ? (
            <>
              <Text className="text-sm block">เลขพัสดุ: <Text code>{otherTracking}</Text></Text>
              {otherConfirmed ? (
                <Tag color="success" className="mt-1">ยืนยันรับแล้ว ✓</Tag>
              ) : (
                <Tag color="orange" className="mt-1">รอยืนยัน</Tag>
              )}
            </>
          ) : (
            <Text type="secondary" className="text-sm">ยังไม่ส่ง</Text>
          )}
        </div>
      </div>

      {exec.status === "CANCELLED" && exec.cancel_reason && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <Text type="danger" className="text-sm">
            เหตุผลการยกเลิก: {exec.cancel_reason}
          </Text>
        </div>
      )}

      {canAct && (
        <div className="flex justify-end pt-2">
          <Button danger size="small" loading={isCancelling} onClick={handleCancel}>
            ยกเลิกการแลกเปลี่ยน
          </Button>
        </div>
      )}
    </div>
  );
}

export default function TradeExecutionsList() {
  const { user } = useAuth();
  const [selectedExec, setSelectedExec] = useState<TradeExecution | null>(null);

  const { data: executions = [], isLoading } = useQuery({
    queryKey: ["trading", "executions"],
    queryFn: getMyTradeExecutions,
    select: (data) => data ?? [],
    enabled: !!user,
  });

  const columns = [
    {
      title: "คู่ค้า",
      key: "partner",
      render: (_: unknown, record: TradeExecution) => {
        const isPartyA = record.party_a_user_id === user?.users_id;
        const partner = isPartyA ? record.party_b_username : record.party_a_username;
        return <Text>{partner ?? "—"}</Text>;
      },
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
      title: "เลขพัสดุของคุณ",
      key: "my_tracking",
      render: (_: unknown, record: TradeExecution) => {
        const isPartyA = record.party_a_user_id === user?.users_id;
        const tracking = isPartyA ? record.party_a_tracking : record.party_b_tracking;
        return tracking ? <Text code className="text-xs">{tracking}</Text> : <Text type="secondary">—</Text>;
      },
    },
    {
      title: "วันที่",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => <Text className="text-sm">{formatDate(v, true)}</Text>,
    },
    {
      title: "",
      key: "actions",
      render: (_: unknown, record: TradeExecution) => (
        <Button size="small" onClick={() => setSelectedExec(record)}>
          จัดการ
        </Button>
      ),
    },
  ];

  if (!isLoading && executions.length === 0) {
    return (
      <Empty
        image={<SwapOutlined className="text-5xl text-gray-300" />}
        description="ยังไม่มีการแลกเปลี่ยนที่ตกลงแล้ว"
        imageStyle={{ height: 64 }}
      >
        <Text type="secondary" className="text-sm">ข้อเสนอที่ได้รับการยอมรับจะปรากฏที่นี่</Text>
      </Empty>
    );
  }

  return (
    <>
      <Table
        columns={columns}
        dataSource={executions}
        rowKey="trade_execution_id"
        loading={isLoading}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        size="middle"
      />

      <Modal
        open={!!selectedExec}
        title="รายละเอียดการแลกเปลี่ยน"
        footer={null}
        onCancel={() => setSelectedExec(null)}
        width={600}
      >
        {selectedExec && user && (
          <ExecutionDetail
            exec={selectedExec}
            myUserID={user.users_id}
            onClose={() => setSelectedExec(null)}
          />
        )}
      </Modal>
    </>
  );
}
