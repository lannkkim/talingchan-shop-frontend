"use client";

import { useState } from "react";
import { Card, Typography, Button, Modal, Input, Alert, Tag, Tooltip, App } from "antd";
import { ApiOutlined, CheckCircleOutlined, WarningOutlined, LockOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enableStockCheck } from "@/services/shop";
import { ShopProfile } from "@/types/shop";

const { Title, Text, Paragraph } = Typography;

interface ShopStockSettingsProps {
  shopData: ShopProfile;
}

export default function ShopStockSettings({ shopData }: ShopStockSettingsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const enableMutation = useMutation({
    mutationFn: enableStockCheck,
    onSuccess: () => {
      message.success("เชื่อมต่อระบบสต็อกสำเร็จ");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["myShop"] });
    },
    onError: () => {
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบสต็อก");
    },
  });

  const handleConnect = () => {
    if (confirmText === "ยืนยันการเชื่อมต่อ") {
      enableMutation.mutate();
    }
  };

  const isEnabled = shopData.is_stock_check_enabled;

  return (
    <Card className="shadow-sm rounded-xl border-none mt-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
           <div className={`p-3 rounded-full ${isEnabled ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
              <ApiOutlined style={{ fontSize: '24px' }} />
           </div>
           <div>
              <Title level={4} className="!mb-1">ระบบเชื่อมต่อสต็อก (Stock Integration)</Title>
              <Text type="secondary" className="block mb-2">
                จัดการการตัดสต็อกอัตโนมัติเมื่อมีคำสั่งซื้อ
              </Text>
              
              {isEnabled ? (
                  <Tag icon={<CheckCircleOutlined />} color="success" className="text-sm py-1 px-3 rounded-full">
                      เชื่อมต่อแล้ว (Connected)
                  </Tag>
              ) : (
                  <Tag icon={<WarningOutlined />} color="warning" className="text-sm py-1 px-3 rounded-full">
                      ยังไม่เชื่อมต่อ (Not Connected)
                  </Tag>
              )}
           </div>
        </div>

        <div>
            {!isEnabled && (
                <Button 
                    type="primary" 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600"
                >
                    เชื่อมต่อสต็อก
                </Button>
            )}
            {isEnabled && (
                 <Tooltip title="ระบบนี้ไม่สามารถปิดการใช้งานได้ เพื่อความถูกต้องของข้อมูลสินค้า">
                    <Button disabled icon={<LockOutlined />}>เปิดใช้งานอยู่</Button>
                 </Tooltip>
            )}
        </div>
      </div>

      {isEnabled && (
          <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-100">
              <Text className="text-green-800">
                  <CheckCircleOutlined className="mr-2" />
                  ระบบกำลังทำงาน: สินค้าจะถูกตัดจากสต็อกโดยอัตโนมัติเมื่อมีคำสั่งซื้อใหม่เข้ามา
              </Text>
          </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-orange-600">
                <WarningOutlined /> ยืนยันการเชื่อมต่อระบบสต็อก
            </div>
        }
        open={isModalOpen}
        onCancel={() => {
            setIsModalOpen(false);
            setConfirmText("");
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={enableMutation.isPending}
            disabled={confirmText !== "ยืนยันการเชื่อมต่อ"}
            onClick={handleConnect}
          >
            ยืนยันและเปิดใช้งาน
          </Button>,
        ]}
      >
        <div className="space-y-4 py-4">
            <Alert
                title="คำเตือนสำคัญ"
                description="เมื่อเปิดใช้งานแล้ว คุณจะไม่สามารถปิดการใช้งานระบบนี้ได้อีก"
                type="warning"
                showIcon
            />
            
            <div>
                <Text strong>การทำงานของระบบ:</Text>
                <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-1">
                    <li>เมื่อลูกค้าสั่งซื้อสินค้า ระบบจะทำการ<b>ตัดสต็อกโดยอัตโนมัติ</b>ทันที</li>
                    <li>สินค้าที่มีการตั้งขายอยู่จะโดนเพิ่มในสต็อกอัตโนมัติและจะไม่สามารถลดจำนวนได้จนกว่าจะลบการขายสินค้านั้น</li>
                </ul>
            </div>

            <div className="pt-2">
                <Text>กรุณาพิมพ์คำว่า <Text code strong>ยืนยันการเชื่อมต่อ</Text> เพื่อดำเนินการต่อ</Text>
                <Input 
                    placeholder="ยืนยันการเชื่อมต่อ" 
                    className="mt-2"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                />
            </div>
        </div>
      </Modal>
    </Card>
  );
}
