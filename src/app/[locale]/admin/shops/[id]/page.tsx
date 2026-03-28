"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, Typography, Descriptions, Button, Image, Space, App, Row, Col } from "antd";
import { getAdminShops, approveShop, AdminShopListResponse } from "@/services/shop";
import { CheckCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "@/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatusTag } from "@/components/shared/StatusTag";
import { formatDate } from "@/utils/format";
import { getShopBankBookUrl } from "@/utils/image";
import { useTranslations } from "next-intl";

const { Title, Text } = Typography;

export default function ShopDetailPage() {
  const t = useTranslations("Admin.Shops");
  const { id } = useParams();
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  
  const { data: shops = [], isLoading } = useQuery<AdminShopListResponse[]>({
    queryKey: ["admin", "shops"],
    queryFn: getAdminShops,
  });

  const shop = shops.find((s) => s.shop_id === id);

  const approveMutation = useMutation({
    mutationFn: (shopId: string) => approveShop(shopId),
    onSuccess: () => {
      message.success(t("messages.approveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["admin", "shops"] });
    },
    onError: () => {
      message.error(t("messages.approveError"));
    },
  });

  const handleApprove = () => {
    if (!shop) return;
    
    modal.confirm({
      title: t("actions.approve"),
      content: `${t("actions.approve")} "${shop.shop_name}"?`,
      okText: t("actions.approve"),
      cancelText: "Cancel", // Standard Cancel
      onOk: () => approveMutation.mutate(shop.shop_id),
    });
  };

  if (isLoading) return <div className="p-10 text-center">{t("messages.loading") || "Loading..." }</div>;
  if (!shop) return <div className="p-10 text-center">{t("messages.notFound")}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
       <div className="mb-6">
        <Link href="/admin/shops" className="text-gray-500 hover:text-blue-500 mb-4 inline-block">
           <Space><ArrowLeftOutlined /> {t("details.back")}</Space>
        </Link>
        <div className="flex justify-between items-center mt-2">
           <Title level={2} className="m-0">{shop.shop_name || "Unknown Shop"}</Title>
           <Space>
             <StatusTag domain="shop" status={shop.status} className="text-lg px-3 py-1 h-auto" />
             {shop.status === "pending_approve" && (
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />} 
                  onClick={handleApprove}
                  loading={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 h-10 px-6"
                >
                  {t("actions.approve")}
                </Button>
             )}
           </Space>
        </div>
       </div>

       <Row gutter={[24, 24]}>
          <Col xs={24} md={14}>
            <Card title={t("details.shopInfo")} className="shadow-sm h-full border-gray-100">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Shop ID">{shop.shop_code}</Descriptions.Item>
                <Descriptions.Item label={t("columns.owner")}>{shop.owner_name}</Descriptions.Item>
                <Descriptions.Item label="Email">{shop.shop_profile?.shop_email || "-"}</Descriptions.Item>
                <Descriptions.Item label="Phone">{shop.shop_profile?.shop_phone || "-"}</Descriptions.Item>
                <Descriptions.Item label={t("columns.requestedDate")}>{formatDate(shop.requested_date, true)}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          
          <Col xs={24} md={10}>
            <Card title={t("details.bankInfo")} className="shadow-sm h-full border-gray-100">
               {shop.shop_bank ? (
                 <div className="flex flex-col gap-4">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Bank">{shop.shop_bank.bank_shortname} ({shop.shop_bank.bank_name})</Descriptions.Item>
                      <Descriptions.Item label="Branch">{shop.shop_bank.branch || "-"}</Descriptions.Item>
                      <Descriptions.Item label="Account Name">{shop.shop_bank.account_name}</Descriptions.Item>
                      <Descriptions.Item label="Account Number">
                          <Text copyable strong className="text-lg">{shop.shop_bank.account_number}</Text>
                      </Descriptions.Item>
                    </Descriptions>
                    
                    {shop.shop_bank.book_image && (
                      <div className="mt-2">
                        <Text strong className="mb-2 block text-xs uppercase text-gray-400">{t("details.bookImage")}</Text>
                        <Image 
                          src={getShopBankBookUrl(shop.shop_bank.book_image)} 
                          alt="Bank Book" 
                          width="100%" 
                          className="rounded-lg border border-gray-100 object-contain max-h-60"
                        />
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="text-gray-400 py-10 text-center italic">{t("details.noBank")}</div>
               )}
            </Card>
          </Col>
       </Row>
    </div>
  );
}
