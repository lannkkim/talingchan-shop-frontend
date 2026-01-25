import React from "react";
import Image from "next/image";
import { Modal, Typography, Row, Col, Space, Tag, Divider, Button } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { Product } from "@/types/product";
import { getCardImageUrl } from "@/utils/image";
import Link from "next/link";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";

const { Title, Text } = Typography;

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const t = useTranslations("Admin.Products.details");

  if (!product) return null;

  return (
    <Modal
      title={null} // Custom Header
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      className="p-0"
    >
      {/* Custom Header area inside Modal content */}
      <div className="mb-6">
        <Space className="w-full justify-between items-start">
          <div>
            <Title level={4} className="m-0 mb-1">
              {product.name}
            </Title>
            <Space separator={<div className="w-px h-3 bg-gray-300" />}>
              <Text type="secondary" className="text-xs">
                {t("id")}: {product.product_id}
              </Text>
              <Tag
                color={
                  product.status === "active"
                    ? "green"
                    : product.status === "pending"
                      ? "orange"
                      : "default"
                }
              >
                {product.status.toUpperCase()}
              </Tag>
              <Text type="secondary" className="text-xs">
                {t("type")}: {product.product_type?.name}
              </Text>
              <Text type="secondary" className="text-xs">
                {t("created")}:{" "}
                {product.created_at
                  ? dayjs(product.created_at).format("DD/MM/YYYY")
                  : "-"}
              </Text>
            </Space>
          </div>
          {/* Maybe add View Market Link if active? */}
        </Space>
      </div>

      <Row gutter={24}>
        {/* Left Column: Product Cards List */}
        <Col span={12} className="border-r border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <Title level={5} className="m-0">
              {t("includedCards")}
            </Title>
            <Tag>
              {product.product_stock_card?.length || 0} {t("items")}
            </Tag>
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
            {product.product_stock_card?.map((pc) => {
              const card = pc.card || pc.stock_card?.card;
              return (
                <div
                  key={pc.product_stock_card_id}
                  className="flex gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="relative w-12 h-16 rounded overflow-hidden bg-white flex-shrink-0 border border-gray-200">
                    <Image
                      src={getCardImageUrl(card?.image_name || "back")}
                      alt={card?.name || "Card"}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text
                      strong
                      className="block truncate text-sm"
                      title={card?.name}
                    >
                      {card?.name}
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      {card?.rare && (
                        <Tag className="m-0 text-[10px]" color="gold">
                          {card.rare}
                        </Tag>
                      )}
                      <Text type="secondary" className="text-xs">
                        {card?.type}
                      </Text>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <Tag color="blue" className="mb-1">
                      x{pc.quantity}
                    </Tag>
                  </div>
                </div>
              );
            })}
          </div>
        </Col>

        {/* Right Column: details */}
        <Col span={12}>
          <Space orientation="vertical" size="middle" className="w-full">
            <div>
              <Text type="secondary" className="block text-xs">
                {t("description")}
              </Text>
              <Text className="text-sm">
                {product.description || t("noDescription")}
              </Text>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Space orientation="vertical" className="w-full">
                <div className="flex justify-between items-center">
                  <Text type="secondary">{t("price")}</Text>
                  {(() => {
                    const activePrice = product.price_period?.[0];
                    return activePrice ? (
                      <div className="text-right">
                        <Text strong className="text-lg text-blue-600 block">
                          ฿{Number(activePrice.price).toLocaleString()}
                        </Text>
                        {activePrice.price_period_ended && (
                          <Text type="secondary" className="text-[10px] block">
                            {t("validUntil")}:{" "}
                            {dayjs(activePrice.price_period_ended).format(
                              "DD/MM/YYYY HH:mm",
                            )}
                          </Text>
                        )}
                      </div>
                    ) : (
                      <Text>-</Text>
                    );
                  })()}
                </div>
                <div className="flex justify-between items-center">
                  <Text type="secondary">{t("inStock")}</Text>
                  <Text strong>{product.quantity} Sets</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text type="secondary">{t("totalCards")}</Text>
                  <Text strong>
                    {product.product_stock_card?.reduce(
                      (sum, pc) => sum + pc.quantity,
                      0,
                    ) || 0}{" "}
                    cards
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text type="secondary">{t("startDate")}</Text>
                  <Text strong className="text-xs">
                    {product.started_at
                      ? dayjs(product.started_at).format("DD/MM/YYYY HH:mm")
                      : "-"}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text type="secondary">{t("endDate")}</Text>
                  <Text strong className="text-xs">
                    {product.ended_at
                      ? dayjs(product.ended_at).format("DD/MM/YYYY HH:mm")
                      : "-"}
                  </Text>
                </div>
              </Space>
            </div>

            <Divider className="my-2" />

            <div>
              <Text
                type="secondary"
                className="block text-xs uppercase tracking-wider mb-3"
              >
                {t("sellerInfo")}
              </Text>
              {product.is_admin_shop ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    T
                  </div>
                  <div>
                    <Text strong className="block text-blue-900">
                      {t("official")}
                    </Text>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                    {product.users?.shop?.shop_profile?.shop_name?.charAt(0) ||
                      product.users?.username?.charAt(0) ||
                      "U"}
                  </div>
                  <div>
                    <Text strong className="block">
                      {product.users?.shop?.shop_profile?.shop_name ||
                        product.users?.username ||
                        "Unknown"}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      {t("userId")}: {product.user_id}
                    </Text>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={onClose}>{t("close")}</Button>
            </div>
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};
