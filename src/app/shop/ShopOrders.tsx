"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getShopOrders, updateTrackingNo, getTransportations } from "@/services/order";
import { Table, Tag, Typography, Space, Card, Badge, Empty, Skeleton, Avatar, Button, Modal, Input, Select, Tooltip, App } from "antd";
import type { Order, OrderProduct, Transportation } from "@/types/order";
import dayjs from "dayjs";
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  CreditCardOutlined, 
  CarOutlined, 
  PlusOutlined, 
  EditOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import { getCardImageUrl } from "@/utils/image";
import { useState } from "react";

const { Text } = Typography;

export default function ShopOrders() {
  const queryClient = useQueryClient();
  const { message: messageApi } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [trackingNo, setTrackingNo] = useState("");
  const [transportationId, setTransportationId] = useState<number | undefined>(undefined);

  const { data: orders, isLoading, isError } = useQuery<Order[]>({
    queryKey: ["shopOrders"],
    queryFn: getShopOrders,
  });

  const { data: transportations } = useQuery<Transportation[]>({
    queryKey: ["transportations"],
    queryFn: getTransportations,
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, trackingNo, transportId }: { orderId: number; trackingNo: string; transportId?: number }) => 
      updateTrackingNo(orderId, trackingNo, transportId),
    onSuccess: () => {
      messageApi.success("อัปเดตหมายเลขติดตามพัสดุเรียบร้อยแล้ว");
      setIsModalVisible(false);
      setTrackingNo("");
      setTransportationId(undefined);
      setCurrentOrder(null);
      queryClient.invalidateQueries({ queryKey: ["shopOrders"] });
    },
    onError: (err: any) => {
      messageApi.error("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
    }
  });

  const showModal = (order: Order) => {
    setCurrentOrder(order);
    setTrackingNo(order.tracking_no || "");
    setTransportationId(order.transportation?.transportation_id);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (currentOrder && trackingNo.trim()) {
      updateMutation.mutate({ 
        orderId: currentOrder.order_id, 
        trackingNo, 
        transportId: transportationId 
      });
    } else {
      messageApi.warning("กรุณากรอกหมายเลขติดตามพัสดุ");
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border-gray-100">
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="shadow-sm border-gray-100">
        <div className="py-12 text-center">
          <Text type="danger">เกิดข้อผิดพลาดในการโหลดข้อมูลคำสั่งซื้อ</Text>
        </div>
      </Card>
    );
  }

  // Check if any order has shipping info to show/hide column
  const hasShippingInfo = orders?.some(o => o.tracking_no || o.transportation);

  const columns = [
    {
      title: "คำสั่งซื้อ",
      key: "order_id",
      render: (_: any, record: Order) => (
        <Space orientation="vertical" size={0}>
          <Text strong>#{record.order_id}</Text>
          <Text type="secondary" className="text-[10px]">
            <ClockCircleOutlined className="mr-1" />
            {dayjs(record.created_at).format("DD/MM/YYYY HH:mm")}
          </Text>
          {record.payment_type && (
            <div className="flex items-center gap-1 text-[10px] text-blue-500 font-medium">
              <CreditCardOutlined />
              {record.payment_type.name}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "ลูกค้า",
      key: "buyer",
      render: (_: any, record: Order) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.buyer?.image} />
          <Space orientation="vertical" size={0}>
            <Text strong className="text-xs">{record.buyer?.username}</Text>
            {record.address_user && (
                <div className="flex items-start gap-1 text-[10px] text-gray-400 max-w-[150px]">
                    <EnvironmentOutlined className="mt-0.5" />
                    <Text type="secondary" className="text-[10px]" ellipsis={{ tooltip: record.address_user.detail }}>
                        {record.address_user.detail}
                    </Text>
                </div>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: "รายการสินค้า",
      key: "items",
      render: (_: any, record: Order) => (
        <div className="flex -space-x-2 overflow-hidden py-1">
          {record.order_product?.map((item: OrderProduct, idx: number) => {
            const productImage = item.product?.product_stock_card?.[0]?.card?.image_name || item.product?.name;
            return (
              <Tooltip key={item.order_product_id} title={`${item.product?.name} x ${item.quantity}`}>
                <img 
                  src={getCardImageUrl(productImage)} 
                  alt={item.product?.name} 
                  className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm ring-1 ring-gray-100"
                  style={{ zIndex: 10 - idx }}
                />
              </Tooltip>
            );
          })}
        </div>
      ),
    },
    {
      title: "ยอดรวม",
      key: "total",
      align: "right" as const,
      render: (_: any, record: Order) => (
        <Space orientation="vertical" size={0} align="end">
          <Text strong className="text-base text-green-600">฿{parseFloat(record.total_price).toLocaleString()}</Text>
          <Text type="secondary" className="text-[10px]">
             {record.order_quantity} ชิ้น
          </Text>
        </Space>
      ),
    },
  ];

  // Dynamically add Shipping column if needed
  if (hasShippingInfo) {
    columns.push({
      title: "การขนส่ง",
      key: "shipping",
      render: (_: any, record: Order) => {
        if (!record.tracking_no && !record.transportation) return <></>;
        return (
          <Space orientation="vertical" size={2}>
            {record.transportation && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <CarOutlined className="text-green-500" />
                {record.transportation.name}
              </div>
            )}
            {record.tracking_no && (
               <div className="flex items-center gap-1">
                 <Tag color="cyan" variant="filled" className="m-0 text-[11px] font-mono px-2 py-0.5">
                   {record.tracking_no}
                 </Tag>
                 <Button 
                   type="text" 
                   size="small" 
                   className="p-0 h-auto"
                   icon={<EditOutlined className="text-gray-300 hover:text-blue-500 text-[12px]" />} 
                   onClick={() => showModal(record)}
                 />
               </div>
            )}
          </Space>
        );
      },
    });
  }

  // Final column: Status & Actions
  columns.push({
    title: "สถานะ",
    key: "status_actions",
    align: "right" as const,
    render: (_: any, record: Order) => {
      let color = "default";
      let text = record.status;
      
      if (record.status === "paid") {
        color = "success";
        text = "ชำระเงินแล้ว";
      } else if (record.status === "pending") {
        color = "warning";
        text = "รอชำระเงิน";
      } else if (record.status === "shipped") {
        color = "processing";
        text = "จัดส่งแล้ว";
      }

      return (
        <Space orientation="vertical" align="end" size={6}>
          <Tag color={color} variant="filled" className="m-0 text-[10px] border-none px-2">
            {text}
          </Tag>
          
          {(record.status === "paid" || (record.status === "shipped" && !record.tracking_no)) && (
            <Button 
              type="primary" 
              size="small" 
              icon={<PlusOutlined />} 
              onClick={() => showModal(record)}
              className="text-[10px] px-3 h-7 bg-blue-600"
            >
              เพิ่มเลขพัสดุ
            </Button>
          )}

          {record.status === "shipped" && record.tracking_no && (
             <div className="flex items-center gap-1 text-[10px] text-green-500">
                <CheckCircleOutlined />
                <span className="font-medium">จัดส่งเรียบร้อย</span>
             </div>
          )}
        </Space>
      );
    },
  });

  return (
    <>
      <Card 
        className="shadow-sm border-gray-100 overflow-hidden" 
        styles={{ body: { padding: 0 } }}
        title={
          <div className="flex items-center gap-2 py-4">
              <ShoppingCartOutlined className="text-blue-500" />
              <Text strong>รายการคำสั่งซื้อทั้งหมด</Text>
          </div>
        }
      >
        {orders && orders.length > 0 ? (
          <Table 
            dataSource={orders} 
            columns={columns} 
            rowKey="order_id" 
            pagination={{ pageSize: 10 }}
            className="shop-orders-table"
          />
        ) : (
          <div className="py-20">
            <Empty description="ยังไม่มีรายการคำสั่งซื้อ" />
          </div>
        )}
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <CarOutlined className="text-blue-500" />
            <span>{currentOrder?.tracking_no ? "แก้ไขข้อมูลการจัดส่ง" : "ระบุข้อมูลการจัดส่ง"}</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={updateMutation.isPending}
        okText="บันทึกข้อมูล"
        cancelText="ยกเลิก"
        centered
        width={400}
      >
        <div className="py-4 space-y-4">
          <div>
            <div className="text-[11px] text-gray-500 mb-1.5 ml-1 font-medium italic">บริษัทขนส่ง</div>
             <Select
              className="w-full"
              placeholder="เลือกบริษัทขนส่ง"
              value={transportationId}
              onChange={(value) => setTransportationId(value)}
            >
               {transportations?.map(t => (
                  <Select.Option key={t.transportation_id} value={t.transportation_id}>{t.name}</Select.Option>
               ))}
            </Select>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 mb-1.5 ml-1 font-medium italic">หมายเลขติดตามพัสดุ</div>
            <Input 
              placeholder="ระบุหมายเลขพัสดุ (เช่น TH123456789)" 
              value={trackingNo} 
              onChange={(e) => setTrackingNo(e.target.value)}
              onPressEnter={handleOk}
              prefix={<CarOutlined className="text-gray-300" />}
            />
          </div>
          {currentOrder && (
             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                <Text type="secondary" className="text-[11px] block text-blue-600 leading-relaxed">
                   * เมื่อบันทึกแล้ว สถานะจะเปลี่ยนเป็น <b>จัดส่งเรียบร้อย</b> อัตโนมัติ ลูกค้าจะได้รับการแจ้งเตือนเลขพัสดุ
                </Text>
             </div>
          )}
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .shop-orders-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #8c8c8c;
          padding: 12px 16px;
        }
        .shop-orders-table .ant-table-tbody > tr > td {
          padding: 12px 16px;
        }
        .shop-orders-table .ant-table-tbody > tr:hover > td {
          background-color: #f0f7ff !important;
        }
      `}} />
    </>
  );
}
