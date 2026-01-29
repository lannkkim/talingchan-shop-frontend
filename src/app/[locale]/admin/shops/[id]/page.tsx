"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Typography, Descriptions, Tag, Button, Image, Space, App, Divider, Row, Col } from "antd";
import { getAdminShops, approveShop, AdminShopListResponse } from "@/services/shop";
import { CheckCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "@/navigation";

const { Title, Text } = Typography;

export default function ShopDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { message, modal } = App.useApp();
  
  const [shop, setShop] = useState<AdminShopListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchShopData();
    }
  }, [id]);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      // Since we don't have GetShopByID for admin exposed yet, 
      // efficiently we might just fetch list and filter for now as per MVP plan.
      // In prod, should fetch specific ID.
      const shops = await getAdminShops();
      const found = shops.find((s) => s.shop_id === id);
      if (found) {
        setShop(found);
      } else {
        message.error("Shop not found");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load shop details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!shop) return;
    
    modal.confirm({
      title: "Approve Shop",
      content: `Are you sure you want to approve "${shop.shop_name}"?`,
      okText: "Approve",
      cancelText: "Cancel",
      onOk: async () => {
        setApproving(true);
        try {
          await approveShop(shop.shop_id);
          message.success("Shop approved successfully");
          fetchShopData(); // Refresh
        } catch (error) {
          console.error(error);
          message.error("Failed to approve shop");
        } finally {
          setApproving(false);
        }
      },
    });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!shop) return <div className="p-10 text-center">Shop not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
       <div className="mb-6">
        <Link href="/admin/shops" className="text-gray-500 hover:text-blue-500 mb-4 inline-block">
           <Space><ArrowLeftOutlined /> Back to List</Space>
        </Link>
        <div className="flex justify-between items-center mt-2">
           <Title level={2} className="m-0">{shop.shop_name || "Unknown Shop"}</Title>
           <Space>
             <Tag color={shop.status === "approved" ? "success" : shop.status === "pending_approve" ? "warning" : "default"} className="text-lg px-3 py-1">
                {shop.status.toUpperCase()}
             </Tag>
             {shop.status === "pending_approve" && (
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />} 
                  onClick={handleApprove}
                  loading={approving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve Shop
                </Button>
             )}
           </Space>
        </div>
       </div>

       <Row gutter={[24, 24]}>
          <Col xs={24} md={14}>
            <Card title="Shop Information" className="shadow-sm h-full">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Shop ID">{shop.shop_code}</Descriptions.Item>
                <Descriptions.Item label="Owner Name">{shop.owner_name}</Descriptions.Item>
                <Descriptions.Item label="Email">{shop.shop_profile?.shop_email || "-"}</Descriptions.Item>
                <Descriptions.Item label="Phone">{shop.shop_profile?.shop_phone || "-"}</Descriptions.Item>
                <Descriptions.Item label="Requested Date">{new Date(shop.requested_date).toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          
          <Col xs={24} md={10}>
            <Card title="Bank Information" className="shadow-sm h-full">
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
                        <Text strong className="mb-2 block">Book Bank Image:</Text>
                        <Image 
                          src={shop.shop_bank.book_image} 
                          alt="Bank Book" 
                          width="100%" 
                          className="rounded-lg border object-contain max-h-60"
                        />
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="text-gray-400 py-10 text-center">No Bank Information Available</div>
               )}
            </Card>
          </Col>
       </Row>
    </div>
  );
}
