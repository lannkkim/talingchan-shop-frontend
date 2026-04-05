"use client";

import { useQuery } from "@tanstack/react-query";
import { Modal, Tag, Typography, Divider, Statistic, Row, Col, Button, Skeleton, Space } from "antd";
import { ArrowDownOutlined, BarChartOutlined, ShoppingOutlined } from "@ant-design/icons";
import Image from "next/image";
import { Card } from "@/types/card";
import { getCardAnalytics } from "@/services/card";
import { getCardImageUrl } from "@/utils/image";
import { useRouter } from "@/navigation";

const { Title, Text } = Typography;

interface CardDetailModalProps {
  card: Card | null;
  open: boolean;
  onClose: () => void;
}

export default function CardDetailModal({ card, open, onClose }: CardDetailModalProps) {
  const router = useRouter();

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["card", card?.card_id, "analytics"],
    queryFn: () => getCardAnalytics(card!.card_id),
    enabled: open && !!card?.card_id,
    staleTime: 5 * 60 * 1000,
    select: (data) => data ?? null,
  });

  if (!card) return null;

  const handleGoToMarket = () => {
    onClose();
    router.push(`/market/cards/${card.card_id}`);
  };

  const details: { label: string; value: string | number | null | undefined }[] = [
    { label: "Type", value: card.type },
    { label: "Rarity", value: card.rare },
    { label: "Print", value: card.print },
    { label: "Color", value: card.color },
    { label: "Subtype", value: card.subtype },
    { label: "Symbol", value: card.symbol },
    { label: "Cost", value: card.cost },
    { label: "Gem", value: card.gem },
    { label: "Power", value: card.power },
  ].filter((d) => d.value != null && d.value !== "");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      styles={{ body: { padding: 0 } }}
      destroyOnHidden
    >
      <div className="flex flex-col sm:flex-row">
        {/* Left — Card Image */}
        <div className="sm:w-[220px] flex-shrink-0 bg-gray-50 flex items-center justify-center p-6 rounded-l-lg">
          <div className="relative w-[160px] aspect-[3/4]">
            <Image
              src={getCardImageUrl(card.image_name, "medium")}
              alt={card.name}
              fill
              className="object-contain drop-shadow-md"
              unoptimized
            />
          </div>
        </div>

        {/* Right — Details */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          {/* Header */}
          <div>
            <Title level={4} className="!mb-1">{card.name}</Title>
            <Space size={4} wrap>
              <Tag color="blue">{card.type}</Tag>
              <Tag color="gold">{card.rare}</Tag>
              {card.color && <Tag color="green">{card.color}</Tag>}
              {card.subtype && <Tag>{card.subtype}</Tag>}
            </Space>
          </div>

          {/* Card Attributes */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {details.map((d) => (
              <div key={d.label} className="flex justify-between border-b border-gray-100 pb-1">
                <Text type="secondary">{d.label}</Text>
                <Text>{String(d.value)}</Text>
              </div>
            ))}
          </div>

          {card.main_effect && (
            <>
              <Divider className="!my-0" />
              <div>
                <Text type="secondary" className="text-xs uppercase tracking-wider block mb-1">Effect</Text>
                <Text className="text-sm leading-relaxed">{card.main_effect}</Text>
              </div>
            </>
          )}

          <Divider className="!my-0" />

          {/* Market Analytics */}
          <div>
            <Text type="secondary" className="text-xs uppercase tracking-wider block mb-3">ราคาตลาดปัจจุบัน</Text>
            {loadingAnalytics ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title={<span className="text-xs">ราคาต่ำสุด</span>}
                    value={analytics?.min_price ?? 0}
                    precision={0}
                    prefix="฿"
                    styles={{ content: { fontSize: 16, color: analytics?.min_price ? "#3f8600" : undefined } }}
                    suffix={analytics?.min_price ? <ArrowDownOutlined style={{ fontSize: 12 }} /> : null}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span className="text-xs">ราคาเฉลี่ย</span>}
                    value={analytics?.avg_price ?? 0}
                    precision={0}
                    prefix="฿"
                    styles={{ content: { fontSize: 16 } }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<span className="text-xs">สินค้าตั้งขาย</span>}
                    value={analytics?.active_listings ?? 0}
                    prefix={<BarChartOutlined />}
                    styles={{ content: { fontSize: 16 } }}
                  />
                </Col>
              </Row>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2">
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={handleGoToMarket}
              block
            >
              ดูราคาตลาด & สินค้า
            </Button>
            <Button onClick={onClose}>ปิด</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
