"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Typography, Modal, Spin, App } from "antd";
import { DownloadOutlined, DeleteOutlined, WarningOutlined } from "@ant-design/icons";
import { exportMyData, requestDeletion } from "@/services/pdpa";
import type { DataExport } from "@/types/pdpa";
import { formatDate } from "@/utils/format";

const { Title, Text, Paragraph } = Typography;

export default function PrivacySettings() {
  const { message: antMessage, modal } = App.useApp();
  const [exportData, setExportData] = useState<DataExport | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const exportMutation = useMutation({
    mutationFn: exportMyData,
    onSuccess: (data) => {
      setExportData(data);
      setExportModalOpen(true);
    },
    onError: () => antMessage.error("ไม่สามารถดาวน์โหลดข้อมูลได้"),
  });

  const deleteMutation = useMutation({
    mutationFn: requestDeletion,
    onSuccess: (data) => {
      antMessage.success(data.message);
    },
    onError: () => antMessage.error("ไม่สามารถส่งคำขอได้"),
  });

  const handleDeleteRequest = () => {
    modal.confirm({
      title: "ยืนยันการขอลบข้อมูล",
      icon: <WarningOutlined className="text-red-500" />,
      content:
        "บัญชีของคุณจะถูกปิดการใช้งาน และข้อมูลส่วนตัวจะถูกลบอย่างถาวรหลังจาก 30 วัน คุณแน่ใจหรือไม่?",
      okText: "ยืนยัน",
      okButtonProps: { danger: true },
      cancelText: "ยกเลิก",
      onOk: () => deleteMutation.mutate(),
    });
  };

  const handleDownloadExport = () => {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Export Data */}
      <div className="border border-gray-100 p-6 space-y-4">
        <div>
          <Title level={5} className="!mb-1">
            ดาวน์โหลดข้อมูลของฉัน (PDPA)
          </Title>
          <Paragraph type="secondary" className="!mb-0 text-sm">
            รับสำเนาข้อมูลส่วนตัวทั้งหมดที่เราเก็บไว้ในรูปแบบ JSON
          </Paragraph>
        </div>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => exportMutation.mutate()}
          loading={exportMutation.isPending}
        >
          ดาวน์โหลดข้อมูลของฉัน
        </Button>
      </div>

      {/* Delete Account */}
      <div className="border border-red-100 p-6 space-y-4 bg-red-50/30">
        <div>
          <Title level={5} className="!mb-1 text-red-600">
            ขอลบข้อมูลและบัญชี
          </Title>
          <Paragraph type="secondary" className="!mb-0 text-sm">
            หลังจากส่งคำขอ บัญชีของคุณจะถูกปิดการใช้งานทันที และข้อมูลทั้งหมดจะถูกลบหลังจาก 30 วัน
          </Paragraph>
        </div>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDeleteRequest}
          loading={deleteMutation.isPending}
        >
          ขอลบบัญชีและข้อมูล
        </Button>
      </div>

      {/* Export Preview Modal */}
      <Modal
        title="ข้อมูลของคุณ"
        open={exportModalOpen}
        onCancel={() => setExportModalOpen(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadExport}>
            ดาวน์โหลด JSON
          </Button>,
          <Button key="close" onClick={() => setExportModalOpen(false)}>
            ปิด
          </Button>,
        ]}
        width={600}
      >
        {exportData && (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <Text type="secondary">User ID</Text>
              <Text>{exportData.user_id}</Text>
              <Text type="secondary">ส่งออกเมื่อ</Text>
              <Text>{formatDate(exportData.exported_at, true)}</Text>
              <Text type="secondary">คำสั่งซื้อ</Text>
              <Text>{exportData.orders.length} รายการ</Text>
              <Text type="secondary">ที่อยู่</Text>
              <Text>{exportData.addresses.length} รายการ</Text>
              <Text type="secondary">รีวิว</Text>
              <Text>{exportData.reviews.length} รายการ</Text>
              <Text type="secondary">รายการโปรด</Text>
              <Text>{exportData.favorites.length} รายการ</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
