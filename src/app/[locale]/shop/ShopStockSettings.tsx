"use client";

import { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  Input,
  Alert,
  Tag,
  Tooltip,
  App,
} from "antd";
import {
  ApiOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enableStockCheck } from "@/services/shop";
import { ShopProfile } from "@/types/shop";
import { useTranslations } from "next-intl";

const { Title, Text, Paragraph } = Typography;

interface ShopStockSettingsProps {
  shopData: ShopProfile;
}

export default function ShopStockSettings({
  shopData,
}: ShopStockSettingsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const t = useTranslations("Shop.stock");

  const enableMutation = useMutation({
    mutationFn: enableStockCheck,
    onSuccess: () => {
      message.success(t("success"));
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["myShop"] });
    },
    onError: () => {
      message.error(t("error"));
    },
  });

  const handleConnect = () => {
    if (confirmText === t("modal.confirmText")) {
      enableMutation.mutate();
    }
  };

  const isEnabled = shopData.is_stock_check_enabled;

  return (
    <Card className="shadow-sm rounded-xl border-none mt-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div
            className={`p-3 rounded-full ${isEnabled ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}
          >
            <ApiOutlined style={{ fontSize: "24px" }} />
          </div>
          <div>
            <Title level={4} className="!mb-1">
              {t("title")}
            </Title>
            <Text type="secondary" className="block mb-2">
              {t("description")}
            </Text>

            {isEnabled ? (
              <Tag
                icon={<CheckCircleOutlined />}
                color="success"
                className="text-sm py-1 px-3 rounded-full"
              >
                {t("connected")}
              </Tag>
            ) : (
              <Tag
                icon={<WarningOutlined />}
                color="warning"
                className="text-sm py-1 px-3 rounded-full"
              >
                {t("notConnected")}
              </Tag>
            )}
          </div>
        </div>

        <div>
          {!isEnabled && (
            <Button
              type="primary"
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600"
            >
              {t("connect")}
            </Button>
          )}
          {isEnabled && (
            <Tooltip title={t("activeTooltip")}>
              <Button disabled icon={<LockOutlined />}>
                {t("active")}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {isEnabled && (
        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-100">
          <Text className="text-green-800">
            <CheckCircleOutlined className="mr-2" />
            {t("running")}
          </Text>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-orange-600">
            <WarningOutlined /> {t("modal.title")}
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setConfirmText("");
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            {t("modal.cancel")}
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={enableMutation.isPending}
            disabled={confirmText !== t("modal.confirmText")}
            onClick={handleConnect}
          >
            {t("modal.confirm")}
          </Button>,
        ]}
      >
        <div className="space-y-4 py-4">
          <Alert
            title={t("modal.warningTitle")}
            description={t("modal.warningDesc")}
            type="warning"
            showIcon
          />

          <div>
            <Text strong>{t("modal.howItWorks")}</Text>
            <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-1">
              <li>
                <span
                  dangerouslySetInnerHTML={{ __html: t.raw("modal.point1") }}
                />
              </li>
              <li>{t("modal.point2")}</li>
            </ul>
          </div>

          <div className="pt-2">
            <Text>
              {t.rich("modal.typeInstruction", {
                text: t("modal.confirmText"),
              })}
            </Text>
            <Input
              placeholder={t("modal.placeholder")}
              className="mt-2"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
}
