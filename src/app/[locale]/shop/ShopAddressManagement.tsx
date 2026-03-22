"use client";

import React, { useState } from "react";
import Button from "antd/es/button";
import Card from "antd/es/card";
import Typography from "antd/es/typography";
import Tag from "antd/es/tag";
import Space from "antd/es/space";
import Empty from "antd/es/empty";
import Popconfirm from "antd/es/popconfirm";
import App from "antd/es/app";
import {
  PlusOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getShopAddresses,
  deleteShopAddress,
  setShopDefaultAddress,
  createShopAddress,
} from "@/services/address";
import AddAddressModal from "../profile/AddAddressModal";
import { Address } from "@/types/address";
import { useTranslations } from "next-intl";

const { Title, Text } = Typography;

export default function ShopAddressManagement() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const t = useTranslations("Profile.address"); // Reuse profile address translations for now

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["shopAddresses"],
    queryFn: getShopAddresses,
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteShopAddress(id);
      message.success(t("success.deleted"));
      queryClient.invalidateQueries({ queryKey: ["shopAddresses"] });
    } catch (error) {
      message.error(t("error.delete"));
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setShopDefaultAddress(id);
      message.success(t("success.defaultUpdated"));
      queryClient.invalidateQueries({ queryKey: ["shopAddresses"] });
    } catch (error) {
      message.error(t("error.defaultUpdate"));
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="!mb-0">
            ที่อยู่วางขาย/รับของ
          </Title>
          <Text type="secondary">จัดการที่อยู่ที่ใช้ในการส่งสินค้าและรับสินค้าของร้านค้า</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          {t("add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">{t("loading")}</div>
      ) : addresses.length === 0 ? (
        <Empty description={t("empty")} />
      ) : (
        <div className="space-y-4">
          {addresses.map((addr: Address) => (
            <Card
              key={addr.address_id}
              size="small"
              className={`border-1 ${addr.is_default ? "border-black bg-gray-50/50" : "border-gray-200"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Text strong className="text-base">
                      {addr.name}
                    </Text>
                    <div className="space-x-1">
                      {addr.is_default && (
                        <Tag color="black">ค่าเริ่มต้น</Tag>
                      )}
                      <Tag>{addr.address_type?.name || t("shipping")}</Tag>
                    </div>
                  </div>
                  <div className="text-gray-600 flex gap-2 items-start mt-2">
                    <EnvironmentOutlined className="mt-1 text-gray-400" />
                    <span>
                      <span className="block font-medium text-gray-800 mb-1">
                        {addr.phone}
                      </span>
                      {addr.address}
                      <br />
                      {addr.sub_district}, {addr.district}
                      <br />
                      {addr.province} {addr.zipcode}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {!addr.is_default && (
                    <Button
                      size="small"
                      type="text"
                      className="text-gray-500 hover:text-black"
                      onClick={() => handleSetDefault(addr.address_id)}
                    >
                      {t("setDefault")}
                    </Button>
                  )}
                  <Popconfirm
                    title={t("deleteConfirm")}
                    okText={t("delete")}
                    cancelText={t("cancel")}
                    onConfirm={() => handleDelete(addr.address_id)}
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddAddressModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={createShopAddress}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["shopAddresses"] })
        }
      />
    </div>
  );
}
