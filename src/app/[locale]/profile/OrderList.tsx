"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Tag, Typography, Card, Badge, Empty, Skeleton, Space, Divider, Button } from "antd";
import { getUserOrders, receiveOrder } from "@/services/order";
import { Order } from "@/types/order";
import { ShoppingOutlined, ClockCircleOutlined, CarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { getProductImage } from "@/utils/image";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { OrderStatusTag } from "@/components/Order/OrderStatusTag";

const { Text, Title } = Typography;


export default function OrderList() {
  const { message } = App.useApp();
  const ts = useTranslations("Shop.orders.status");
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders", "me"],
    queryFn: getUserOrders,
  });

  const receiveMutation = useMutation({
    mutationFn: (orderId: string) => receiveOrder(orderId),
    onSuccess: () => {
      message.success("ยืนยันการได้รับสินค้าสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
    },
    onError: () => {
      message.error("เกิดข้อผิดพลาดในการยืนยันการได้รับสินค้า");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-gray-100">
            <Skeleton active avatar paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="ยังไม่มีรายการสั่งซื้อ"
      >
        <Text type="secondary">เริ่มช้อปปิ้งเพื่อสะสมรายการสั่งซื้อของคุณ</Text>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: Order) => (
        <Card 
          key={order.order_id}
          className="mb-4 border-gray-100 hover:shadow-md transition-shadow duration-300 rounded-none"
          styles={{ body: { padding: 0 } }}
        >
          {/* Order Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center px-6">
            <Space orientation="vertical" size={0}>
              <Text type="secondary" className="text-[10px] uppercase tracking-wider">Order No.</Text>
              <Text strong>{order.order_code || order.order_id.slice(0, 8)}</Text>
            </Space>
            <div className="flex items-center gap-6">
              <Space orientation="vertical" size={0} className="text-right">
                <Text type="secondary" className="text-[10px] uppercase tracking-wider">Order Date</Text>
                <Text className="text-xs">{new Date(order.created_at).toLocaleDateString('th-TH', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</Text>
              </Space>
              <OrderStatusTag status={order.status} t={ts} />
            </div>
          </div>

          {/* Shop Header */}
          <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between">
            <Space>
              <ShoppingOutlined className="text-gray-400" />
              <Text strong className="text-sm">{order.shop?.shop_profile?.shop_name || "ร้านค้าทั่วไป"}</Text>
            </Space>
            {order.tracking_no && (
              <Badge status="processing" text={`Tracking: ${order.tracking_no}`} />
            )}
          </div>

          {/* Items */}
          <div className="px-6 py-4 space-y-4">
            {order.order_product.map((item) => (
              <div key={item.order_product_id} className="flex gap-4">
                <div className="relative w-16 h-16 bg-gray-50 overflow-hidden flex-shrink-0">
                  <Image
                    src={getProductImage(item.product)}
                    alt={item.product?.name || "Product"}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Text strong className="block truncate">{item.product?.name || "Unknown Product"}</Text>
                  <div className="flex justify-between items-center mt-1">
                    <Text type="secondary" className="text-xs">
                      ฿{Number(item.price).toLocaleString()} x {item.quantity}
                    </Text>
                    <Text strong>฿{(Number(item.price) * item.quantity).toLocaleString()}</Text>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <Divider className="my-0" />
          <div className="p-4 px-6 flex justify-between items-center">
            <Space orientation="vertical" size={16}>
              <Space orientation="horizontal" size={16}>
                <div className="text-xs text-gray-500">
                  <Text type="secondary" className="mr-1">การชำระเงิน:</Text>
                  <Text>{order.payment_type?.name || "N/A"}</Text>
                </div>
                <div className="text-xs text-gray-500">
                  <Text type="secondary" className="mr-1">การจัดส่ง:</Text>
                  <Text>{order.transportation?.transportation_name || order.transportation?.name || "Standard Delivery"}</Text>
                </div>
              </Space>
              
              {order.status === "RS" && (
                <Button 
                  type="primary" 
                  size="small"
                  className="bg-green-600 hover:!bg-green-700 text-[12px] h-8 px-4"
                  onClick={() => receiveMutation.mutate(order.order_id)}
                  loading={receiveMutation.isPending && receiveMutation.variables === order.order_id}
                >
                  ได้รับสินค้าแล้ว
                </Button>
              )}
            </Space>
            <div className="text-right space-y-1">
              <div className="flex justify-end items-center gap-2">
                <Text type="secondary" className="text-xs">ยอดรวมสินค้า:</Text>
                <Text className="text-sm">฿{(Number(order.total_price) - Number(order.total_shipping || 0)).toLocaleString()}</Text>
              </div>
              <div className="flex justify-end items-center gap-2">
                <Text type="secondary" className="text-xs">ค่าจัดส่ง:</Text>
                <Text className="text-sm">฿{Number(order.total_shipping || 0).toLocaleString()}</Text>
              </div>
              <div className="flex justify-end items-center gap-2 mt-1">
                <Text strong className="text-sm">ยอดคำสั่งซื้อรวม:</Text>
                <Text strong className="text-xl text-blue-600">฿{Number(order.total_price).toLocaleString()}</Text>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
