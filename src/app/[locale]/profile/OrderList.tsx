"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Tag, Typography, Card, Badge, Empty, Skeleton, Space, Divider, Button, Modal, Form, Input, Upload } from "antd";
import { getUserOrders, receiveOrder, cancelRequest, requestRefund, updateReturnTracking, uploadPaymentSlip, uploadRefundImages, resubmitPayment } from "@/services/order";
import { getOrCreateThread } from "@/services/chat";
import { Order } from "@/types/order";
import { ShoppingOutlined, ClockCircleOutlined, CarOutlined, CheckCircleOutlined, UploadOutlined, MessageOutlined } from "@ant-design/icons";
import { useRouter } from "@/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getProductImage } from "@/utils/image";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { OrderStatusTag } from "@/components/Order/OrderStatusTag";

const { Text, Title } = Typography;


export default function OrderList() {
  const { message, modal } = App.useApp();
  const t = useTranslations("Orders.me");
  const ts = useTranslations("Shop.orders.status");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const contactMutation = useMutation({
    mutationFn: (sellerId: string) => getOrCreateThread({ participant_id: sellerId }),
    onSuccess: (thread) => {
      router.push(`/chat?thread=${thread.chat_thread_id}`);
    },
    onError: () => message.error("ไม่สามารถเปิดแชทได้"),
  });
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders", "me"],
    queryFn: getUserOrders,
  });

  const receiveMutation = useMutation({
    mutationFn: (orderId: string) => receiveOrder(orderId),
    onSuccess: () => {
      message.success(t("messages.receiveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
    },
    onError: () => {
      message.error(t("messages.receiveError"));
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string, reason: string }) => cancelRequest(orderId, reason),
    onSuccess: () => {
      message.success(t("messages.cancelSuccess"));
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ orderId, reason, images }: { orderId: string, reason: string, images?: string[] }) => 
      requestRefund(orderId, reason, images),
    onSuccess: () => {
      message.success(t("messages.refundSuccess"));
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
    },
  });

  const returnTrackingMutation = useMutation({
    mutationFn: ({ orderId, trackingNo }: { orderId: string, trackingNo: string }) => 
      updateReturnTracking(orderId, trackingNo),
    onSuccess: () => {
      message.success(t("messages.returnSuccess"));
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
    },
  });

  const uploadSlipMutation = useMutation({
    mutationFn: ({ orderId, file }: { orderId: string, file: File }) =>
      uploadPaymentSlip(orderId, file),
    onSuccess: () => {
      message.success(t("messages.uploadSuccess"));
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.error || t("messages.uploadError"));
    }
  });

  const resubmitPaymentMutation = useMutation({
    mutationFn: ({ orderId, file }: { orderId: string, file: File }) =>
      resubmitPayment(orderId, file),
    onSuccess: () => {
      message.success("ส่งหลักฐานการชำระเงินใหม่สำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.error || "ไม่สามารถส่งหลักฐานได้");
    },
  });

  const showCancelModal = (orderId: string) => {
    let reason = "";
    modal.confirm({
      title: t("modals.cancel.title"),
      content: (
        <div className="mt-4">
          <Text type="secondary">{t("modals.cancel.reasonLabel")}</Text>
          <Input.TextArea 
            className="mt-2" 
            placeholder={t("modals.cancel.placeholder")}
            onChange={(e) => reason = e.target.value}
          />
        </div>
      ),
      onOk: async () => {
        if (!reason.trim()) {
          message.warning(t("modals.cancel.error"));
          return Promise.reject();
        }
        await cancelRequestMutation.mutateAsync({ orderId, reason });
      },
    });
  };

  const showRefundModal = (orderId: string) => {
    let reason = "";
    let fileList: File[] = [];
    modal.confirm({
      title: t("modals.refund.title"),
      width: 500,
      content: (
        <div className="mt-4 space-y-4">
          <div>
            <Text type="secondary">{t("modals.refund.reasonLabel") || "Reason for refund"}</Text>
            <Input.TextArea 
              className="mt-2" 
              placeholder={t("modals.refund.placeholder") || "Please describe the problem"}
              onChange={(e) => reason = e.target.value}
            />
          </div>
          <div>
            <Text type="secondary">{t("modals.refund.attachment") || "Evidence (Photos)"}</Text>
            <div className="mt-2">
              <Upload
                listType="picture-card"
                beforeUpload={(file) => {
                  fileList.push(file as File);
                  return false;
                }}
                onRemove={(file) => {
                  fileList = fileList.filter(f => f !== (file as any));
                }}
                multiple
                accept="image/*"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>{t("modals.refund.upload") || "Upload"}</div>
                </div>
              </Upload>
            </div>
            <div className="mt-1 text-[10px] text-gray-400">
              {t("modals.refund.uploadHint") || "Maximum 10MB per image"}
            </div>
          </div>
        </div>
      ),
      onOk: async () => {
        if (!reason.trim()) {
          message.warning(t("modals.refund.error") || "Please provide a reason");
          return Promise.reject();
        }

        let imageUrls: string[] = [];
        if (fileList.length > 0) {
          try {
            imageUrls = await uploadRefundImages(orderId, fileList);
          } catch (err: any) {
            message.error(err?.response?.data?.error || "Failed to upload images");
            return Promise.reject();
          }
        }

        await refundMutation.mutateAsync({ orderId, reason, images: imageUrls });
      },
    });
  };

  const showReturnTrackingModal = (orderId: string) => {
    let trackingNo = "";
    modal.confirm({
      title: t("modals.return.title"),
      content: (
        <div className="mt-4">
          <Text type="secondary">{t("modals.return.label")}</Text>
          <Input 
            className="mt-2" 
            placeholder={t("modals.return.placeholder")}
            onChange={(e) => trackingNo = e.target.value}
          />
        </div>
      ),
      onOk: async () => {
        if (!trackingNo.trim()) {
          message.warning(t("modals.return.error"));
          return Promise.reject();
        }
        await returnTrackingMutation.mutateAsync({ orderId, trackingNo });
      },
    });
  };

  const showUploadSlipModal = (orderId: string) => {
    let selectedFile: File | null = null;
    modal.confirm({
      title: t("modals.slip.title"),
      icon: <UploadOutlined />,
      content: (
        <div className="mt-4">
          <Text type="secondary">{t("modals.slip.label")}</Text>
          <div className="mt-4">
            <Upload
              beforeUpload={(file) => {
                selectedFile = file;
                return false;
              }}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>{t("modals.slip.selectFile")}</Button>
            </Upload>
          </div>
          <div className="mt-2 text-[10px] text-gray-400">
            {t("modals.slip.hint")}
          </div>
        </div>
      ),
      onOk: async () => {
        if (!selectedFile) {
          message.warning(t("modals.slip.error"));
          return Promise.reject();
        }
        await uploadSlipMutation.mutateAsync({ orderId, file: selectedFile });
      },
    });
  };

  const showResubmitModal = (orderId: string) => {
    let selectedFile: File | null = null;
    modal.confirm({
      title: "ส่งหลักฐานการชำระเงินใหม่",
      icon: <UploadOutlined />,
      content: (
        <div className="mt-4">
          <Text type="secondary">การชำระเงินครั้งก่อนถูกปฏิเสธ กรุณาอัปโหลดสลิปที่ถูกต้อง</Text>
          <div className="mt-4">
            <Upload
              beforeUpload={(file) => {
                selectedFile = file;
                return false;
              }}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>เลือกไฟล์สลิป</Button>
            </Upload>
          </div>
          <div className="mt-2 text-[10px] text-gray-400">ไฟล์ไม่เกิน 10MB</div>
        </div>
      ),
      okText: "ส่งหลักฐาน",
      okButtonProps: { danger: false },
      onOk: async () => {
        if (!selectedFile) {
          message.warning("กรุณาเลือกไฟล์สลิป");
          return Promise.reject();
        }
        await resubmitPaymentMutation.mutateAsync({ orderId, file: selectedFile });
      },
    });
  };

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
        description={t("empty")}
      >
        <Text type="secondary">{t("startShopping")}</Text>
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
              <Text strong className="text-sm">{order.shop?.shop_profile?.shop_name || t("shop")}</Text>
              {isAuthenticated && order.shop?.user_id && (
                <Button
                  size="small"
                  icon={<MessageOutlined />}
                  loading={contactMutation.isPending && contactMutation.variables === order.shop.user_id}
                  onClick={() => contactMutation.mutate(order.shop!.user_id)}
                >
                  ติดต่อร้านค้า
                </Button>
              )}
            </Space>
            {order.tracking_no && (
              <Badge status="processing" text={`Tracking: ${order.tracking_no}`} />
            )}
            {order.payment_slip && (
              <Button 
                type="link" 
                size="small" 
                className="text-xs p-0 text-blue-500 hover:text-blue-600"
                onClick={() => {
                  modal.info({
                    title: "หลักฐานการชำระเงิน",
                    width: 400,
                    content: (
                      <div className="mt-4 flex justify-center bg-gray-100 p-2">
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/images/slips/${order.payment_slip}`} 
                          alt="Slip" 
                          className="max-w-full h-auto shadow-sm"
                        />
                      </div>
                    ),
                    footer: null,
                    closable: true,
                    maskClosable: true
                  });
                }}
              >
                ดูสลิปที่อัปโหลดแล้ว
              </Button>
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
              
              <Space orientation="horizontal" size={8}>
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

                {(order.status === "pending_approve" || order.status === "WS") && (
                  <Button 
                    danger
                    size="small"
                    className="text-[12px] h-8 px-4"
                    onClick={() => showCancelModal(order.order_id)}
                    loading={cancelRequestMutation.isPending}
                  >
                    {t("actions.cancel")}
                  </Button>
                )}

                {order.status === "RJ" && (
                  <Button
                    type="primary"
                    size="small"
                    danger
                    className="text-[12px] h-8 px-4"
                    icon={<UploadOutlined />}
                    onClick={() => showResubmitModal(order.order_id)}
                    loading={resubmitPaymentMutation.isPending && resubmitPaymentMutation.variables?.orderId === order.order_id}
                  >
                    ส่งหลักฐานใหม่
                  </Button>
                )}

                {order.status === "pending_approve" && !order.payment_slip && (
                  <Button 
                    type="primary"
                    size="small"
                    className="text-[12px] h-8 px-4 bg-blue-600"
                    icon={<UploadOutlined />}
                    onClick={() => showUploadSlipModal(order.order_id)}
                    loading={uploadSlipMutation.isPending && uploadSlipMutation.variables?.orderId === order.order_id}
                  >
                    {t("actions.notifyPayment")}
                  </Button>
                )}

                {order.status === "RS" && (
                  <Button 
                    type="default"
                    size="small"
                    className="text-[12px] h-8 px-4"
                    onClick={() => showRefundModal(order.order_id)}
                    loading={refundMutation.isPending}
                  >
                    ขอคืนเงิน
                  </Button>
                )}

                {order.status === "WAITING_FOR_RETURN" && (
                  <Button 
                    type="primary"
                    size="small"
                    className="text-[12px] h-8 px-4"
                    onClick={() => showReturnTrackingModal(order.order_id)}
                    loading={returnTrackingMutation.isPending}
                  >
                    ส่งคืนสินค้า
                  </Button>
                )}
              </Space>
            </Space>
            <div className="text-right space-y-1">
              <div className="flex justify-end items-center gap-2">
                <Text type="secondary" className="text-xs">{t("totalItems")}:</Text>
                <Text className="text-sm">฿{(Number(order.total_price) - Number(order.total_shipping || 0)).toLocaleString()}</Text>
              </div>
              <div className="flex justify-end items-center gap-2">
                <Text type="secondary" className="text-xs">{t("shippingFee")}:</Text>
                <Text className="text-sm">฿{Number(order.total_shipping || 0).toLocaleString()}</Text>
              </div>
              <div className="flex justify-end items-center gap-2 mt-1">
                <Text strong className="text-sm">{t("orderTotal")}:</Text>
                <Text strong className="text-xl text-blue-600">฿{Number(order.total_price).toLocaleString()}</Text>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
