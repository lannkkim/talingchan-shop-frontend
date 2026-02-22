"use client";

import React from "react";
import { Modal, Row, Col, Typography, Tag, Divider, Space, Avatar } from "antd";
import { Order } from "@/types/order";
import { getProductImage } from "@/utils/image";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CarOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const t = useTranslations("Shop.orders");

  const STATUS_COLORS: Record<string, string> = {
    pending: "warning",
    pending_approve: "warning",
    paid: "success",
    shipped: "processing",
    completed: "success",
    cancelled: "error",
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnHidden
      centered
      className="product-detail-modal"
    >
      {order ? (
        <div className="p-4">
          <Row gutter={48}>
            {/* Left Column: Ordered Items Visual Grid */}
            <Col span={10}>
              {order.order_product?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-4 max-h-[500px] overflow-y-auto pr-2">
                  {order.order_product.map((item) => {
                    const imageUrl = getProductImage(item.product);
                    return (
                      <div
                        key={item.order_product_id}
                        className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
                      >
                        <Image
                          src={imageUrl}
                          alt={item.product?.name || "Product"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 150px"
                          unoptimized
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-2 text-center truncate">
                          {item.product?.name || "Product"}
                        </div>
                        <div className="absolute top-2 right-2 bg-black text-white text-[10px] px-2 py-1 rounded-full shadow-md font-medium">
                          x{item.quantity}
                        </div>
                        <div className="absolute top-2 left-2 bg-white/90 text-black text-[10px] px-2 py-1 rounded-sm shadow-sm font-medium">
                          ฿{Number(item.price).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-6 text-gray-400">
                  <Space orientation="vertical" align="center">
                    <ShoppingOutlined className="text-4xl hover:!text-gray-400" />
                    <Text type="secondary">No product images</Text>
                  </Space>
                </div>
              )}
              <div className="text-center mt-4">
                <Text type="secondary" className="text-xs">
                  Total {order.order_quantity} items
                </Text>
              </div>
            </Col>

            {/* Right Column: Order Details */}
            <Col span={14}>
              <div className="h-full flex flex-col">
                {/* Header section with status and ID */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    {(() => {
                      let color = "default";
                      let icon = null;
                      switch (order.status) {
                        case "pending_approve":
                        case "pending":
                          color = "warning";
                          icon = <ClockCircleOutlined />;
                          break;
                        case "paid":
                        case "completed":
                          color = "success";
                          icon = <CheckCircleOutlined />;
                          break;
                        case "shipped":
                          color = "processing";
                          icon = <CarOutlined />;
                          break;
                        case "cancelled":
                          color = "error";
                          icon = <CloseCircleOutlined />;
                          break;
                      }
                      return (
                        <Tag
                          color={color}
                          icon={icon}
                          className="m-0 text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border-transparent shadow-sm"
                        >
                          {t(`status.${order.status}`) || order.status}
                        </Tag>
                      );
                    })()}
                    <Text type="secondary" className="text-xs">
                      {dayjs(order.created_at).format("DD MMM YYYY, HH:mm")}
                    </Text>
                  </div>
                  <Title level={4} className="!mt-0 !mb-1">
                    Order #{order.order_code || order.order_id.substring(0, 8)}
                  </Title>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto pr-2 max-h-[500px]">
                  {/* Buyer Information Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <Text strong className="block mb-3 text-xs uppercase tracking-wider text-gray-500">
                      <UserOutlined className="mr-2" />
                      Buyer Information
                    </Text>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        src={(order.buyer?.user_profile as any)?.image || order.buyer?.image}
                        className="border border-gray-200"
                      />
                      <div>
                        <Text strong className="block text-sm">
                          {order.buyer?.username}
                        </Text>
                        {(order.buyer?.first_name || order.buyer?.last_name) && (
                          <Text type="secondary" className="text-xs block">
                            {order.buyer?.first_name} {order.buyer?.last_name}
                          </Text>
                        )}
                        <Text type="secondary" className="text-xs block mt-0.5">
                          {order.buyer?.email}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Shipping & Payment Section */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left block - Shipping Address */}
                    <div>
                      <Text strong className="block mb-2 text-xs uppercase tracking-wider text-gray-500">
                        <EnvironmentOutlined className="mr-1" /> Delivery Details
                      </Text>
                      {order.address_user ? (
                        <div className="text-sm space-y-1 text-gray-700 bg-white p-3 rounded border border-gray-100 h-full">
                          <Text strong className="block mb-1">{order.address_user.name}</Text>
                          <div className="flex items-start gap-1">
                            <PhoneOutlined className="mt-1 text-xs text-gray-400" />
                            <span>{order.address_user.phone}</span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-gray-600">
                            {order.address_user.detail}<br />
                            {order.address_user.sub_district}, {order.address_user.district}<br />
                            {order.address_user.province} {order.address_user.postal_code}
                          </p>
                        </div>
                      ) : (
                        <Text type="secondary" className="text-sm">No address provided</Text>
                      )}
                    </div>

                    {/* Right block - Courier & Payment */}
                    <div className="space-y-4">
                      <div>
                        <Text strong className="block mb-2 text-xs uppercase tracking-wider text-gray-500">
                          <CarOutlined className="mr-1" /> Transport & Tracking
                        </Text>
                        <div className="bg-white p-3 rounded border border-gray-100">
                          <div className="mb-2">
                            <Text type="secondary" className="text-xs mr-2">Courier:</Text>
                            <Text className="text-sm font-medium">{order.transportation?.name || "-"}</Text>
                          </div>
                          <div>
                             <Text type="secondary" className="text-xs mr-2">Tracking:</Text>
                             {order.tracking_no ? (
                               <Tag color="cyan" className="m-0 font-mono text-[11px]">{order.tracking_no}</Tag>
                             ) : (
                               <Text type="secondary" className="text-sm">-</Text>
                             )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Text strong className="block mb-2 text-xs uppercase tracking-wider text-gray-500">
                          <CreditCardOutlined className="mr-1" /> Payment Method
                        </Text>
                         <div className="bg-white p-3 rounded border border-gray-100">
                            <Text className="text-sm font-medium text-blue-600">
                              {order.payment_type?.name || "Standard Check-out"}
                            </Text>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Summary Section */}
                <div className="pt-4 mt-6 border-t border-gray-100 bg-gray-50/50 p-4 rounded-lg">
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <Text type="secondary" className="text-sm">Subtotal ({order.order_quantity} items)</Text>
                      <Text className="text-sm font-medium">฿{(Number(order.total_price) - Number(order.total_shipping)).toLocaleString()}</Text>
                    </div>
                    <div className="flex justify-between items-center">
                      <Text type="secondary" className="text-sm">Shipping Fee</Text>
                      <Text className="text-sm font-medium text-green-600">+ ฿{Number(order.total_shipping).toLocaleString()}</Text>
                    </div>
                  </div>
                  <Divider className="my-2 border-gray-200" />
                  <div className="flex justify-between items-end pt-1">
                    <Text strong className="uppercase text-xs tracking-wider">Grand Total</Text>
                    <Text className="text-2xl font-semibold text-blue-600">
                      ฿{Number(order.total_price).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      ) : null}
    </Modal>
  );
};
