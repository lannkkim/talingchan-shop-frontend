"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Row, Col, Card, Typography, Button, Tag, InputNumber, Modal, App, Spin, Empty } from "antd";
import { GiftOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useState } from "react";
import { getMysteryBoxes, purchaseMysteryBox } from "@/services/mystery-box";
import type { MysteryBox, MysteryBoxPurchase } from "@/types/mystery-box";
import { formatCurrency } from "@/utils/format";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/shared/PageHeader";

const { Title, Text } = Typography;

export default function MysteryBoxesPage() {
  const { isAuthenticated } = useAuth();
  const { message: antMessage } = App.useApp();
  const queryClient = useQueryClient();
  const [selectedBox, setSelectedBox] = useState<MysteryBox | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [resultModal, setResultModal] = useState<MysteryBoxPurchase | null>(null);

  const { data: boxes = [], isLoading } = useQuery({
    queryKey: ["mystery-boxes"],
    queryFn: getMysteryBoxes,
  });

  const purchaseMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      purchaseMysteryBox(id, { quantity: qty }),
    onSuccess: (data) => {
      setResultModal(data);
      setSelectedBox(null);
      queryClient.invalidateQueries({ queryKey: ["mystery-boxes"] });
    },
    onError: (err: any) => {
      antMessage.error(err?.response?.data?.error || "ซื้อไม่สำเร็จ");
    },
  });

  const handlePurchase = () => {
    if (!isAuthenticated) {
      antMessage.warning("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    if (!selectedBox) return;
    purchaseMutation.mutate({ id: selectedBox.mystery_box_id, qty: quantity });
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="กล่องสุ่ม" subtitle="เปิดกล่องสุ่มเพื่อรับการ์ดพิเศษ" />
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="mb-6 flex items-center gap-2">
          <GiftOutlined className="text-2xl text-black" />
          <Title level={3} className="!mb-0">กล่องสุ่มที่มีจำหน่าย</Title>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : boxes.filter((b) => b.is_active).length === 0 ? (
          <Empty description="ยังไม่มีกล่องสุ่มในขณะนี้" className="py-20" />
        ) : (
          <Row gutter={[16, 16]}>
            {boxes
              .filter((box) => box.is_active)
              .map((box: MysteryBox) => (
                <Col key={box.mystery_box_id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    className="border border-gray-100 text-center"
                    cover={
                      <div className="flex items-center justify-center h-40 bg-gradient-to-br from-gray-50 to-gray-100">
                        <GiftOutlined className="text-6xl text-gray-400" />
                      </div>
                    }
                  >
                    <Title level={5} className="!mb-1">
                      {box.name}
                    </Title>
                    {box.description && (
                      <Text type="secondary" className="text-xs block mb-3">
                        {box.description}
                      </Text>
                    )}
                    <div className="text-xl font-bold mb-2">
                      {formatCurrency(box.price)}
                    </div>
                    <Tag className="mb-3">สต็อก: {box.stock}</Tag>
                    <Button
                      type="primary"
                      block
                      icon={<ThunderboltOutlined />}
                      onClick={() => {
                        setSelectedBox(box);
                        setQuantity(1);
                      }}
                      disabled={box.stock === 0}
                    >
                      เปิดกล่อง
                    </Button>
                  </Card>
                </Col>
              ))}
          </Row>
        )}
      </div>

      {/* Purchase Modal */}
      <Modal
        title={`เปิดกล่องสุ่ม: ${selectedBox?.name}`}
        open={!!selectedBox}
        onCancel={() => setSelectedBox(null)}
        footer={null}
      >
        {selectedBox && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <GiftOutlined className="text-5xl text-gray-400 mb-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(selectedBox.price)}{" "}
                <Text type="secondary" className="text-base font-normal">
                  / กล่อง
                </Text>
              </div>
            </div>
            <div>
              <Text className="block mb-2">จำนวน</Text>
              <InputNumber
                min={1}
                max={selectedBox.stock}
                value={quantity}
                onChange={(v) => setQuantity(v || 1)}
                className="w-full"
              />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50">
              <Text>รวม</Text>
              <Text strong className="text-lg">
                {formatCurrency(String(Number(selectedBox.price) * quantity))}
              </Text>
            </div>
            <Button
              type="primary"
              block
              size="large"
              onClick={handlePurchase}
              loading={purchaseMutation.isPending}
            >
              ยืนยันการซื้อ
            </Button>
          </div>
        )}
      </Modal>

      {/* Result Modal */}
      <Modal
        title="คุณได้รับ!"
        open={!!resultModal}
        onCancel={() => setResultModal(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setResultModal(null)}>
            รับไว้เลย
          </Button>,
        ]}
      >
        {resultModal && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <GiftOutlined className="text-6xl text-yellow-400 mb-2" />
              <Text className="block">เปิดกล่อง {resultModal.quantity} ใบ</Text>
            </div>
            <div className="space-y-2">
              {resultModal.items_won.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 border border-gray-100"
                >
                  <Text strong>{item.name}</Text>
                  <Tag color="gold">{item.rarity}</Tag>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
