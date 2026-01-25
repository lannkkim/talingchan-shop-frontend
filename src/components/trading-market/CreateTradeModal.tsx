"use client";

import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  App,
  Typography,
  Divider,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCards } from "@/services/card";
import { getMyProducts, getProducts } from "@/services/product";
import { createTradeList } from "@/services/tradeList";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import CardSelectionGrid from "./CardSelectionGrid";

const { Text, Title } = Typography;

interface CreateTradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateTradeModal({
  open,
  onClose,
}: CreateTradeModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslations("TradingMarket");
  const [selectedTradeId, setSelectedTradeId] = useState<number | undefined>();
  const [step, setStep] = useState(1);

  // Fetch Generic Cards (Encyclopedia)
  const { data: allCards, isLoading: isLoadingCards } = useQuery({
    queryKey: ["cards"],
    queryFn: () => getCards(1, 1000),
    enabled: open,
  });

  // Use generic cards for the first section now
  const tradeProducts = allCards || [];

  const createMutation = useMutation({
    mutationFn: createTradeList,
    onSuccess: () => {
      message.success(t("messages.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["trade-lists"] });
      onClose();
      form.resetFields();
      setStep(1);
      setSelectedTradeId(undefined);
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.error ||
          t("messages.error", { error: error.message }),
      );
    },
  });

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedTradeId) {
        message.error(t("modal.tradeProductRequired"));
        return;
      }
      setStep(2);
    } else {
      // Final submission
      try {
        const values = await form.validateFields();
        createMutation.mutate({
          trade_id: selectedTradeId, // This is now a generic card_id
          cash: values.cash || 0,
          wish_list: values.wish_list, // Text input for wish list
          trade_flag: "card",
          wish_flag: "text",
        } as any); // Cast to any to avoid type check issues if interface not updated yet
      } catch (error) {
        console.error("Validation failed:", error);
      }
    }
  };

  const handleClose = () => {
    setSelectedTradeId(undefined);
    form.resetFields();
    setStep(1);
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
        {isLoadingCards ? (
          <div>Loading cards...</div>
        ) : (
          allCards?.map((card: any) => (
            <div
              key={card.card_id}
              onClick={() => setSelectedTradeId(card.card_id)}
              className={`
                cursor-pointer rounded-lg border-2 p-2 transition-all
                ${selectedTradeId === card.card_id ? "border-primary bg-primary/10" : "border-transparent hover:border-gray-200"}
              `}
            >
              <div className="relative aspect-[3/4] mb-2">
                <img
                  src={
                    card.image_name
                      ? `http://localhost:8080/uploads/${card.image_name}`
                      : "/placeholder-card.png"
                  }
                  alt={card.name}
                  className="object-cover rounded-md w-full h-full"
                />
              </div>
              <p className="text-sm font-medium text-center truncate">
                {card.name}
              </p>
              <p className="text-xs text-gray-500 text-center">{card.type}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <Form form={form} layout="vertical">
        <Form.Item
          name="wish_list"
          label={t("modal.wishListText")}
          rules={[{ required: true, message: t("modal.wishListRequired") }]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t("modal.wishListPlaceholder")}
          />
        </Form.Item>
        <Form.Item
          name="cash"
          label={t("modal.cash")}
          extra={t("modal.cashExtra")}
        >
          <InputNumber
            className="w-full"
            formatter={(value) =>
              `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => Number(value!.replace(/฿\s?|(,*)/g, "")) as any}
            min={0}
            placeholder="0"
          />
        </Form.Item>
      </Form>
      <div className="bg-blue-50 p-4 rounded-lg">
        <Text type="secondary" className="text-sm">
          <strong>{t("modal.note")}</strong> {t("modal.noteText")}
        </Text>
      </div>
    </div>
  );

  return (
    <Modal
      title={
        step === 1 ? t("modal.createTitleStep1") : t("modal.createTitleStep2")
      }
      open={open}
      onOk={handleNext}
      onCancel={handleClose}
      confirmLoading={createMutation.isPending}
      okText={step === 1 ? t("modal.next") : t("modal.create")}
      cancelText={t("modal.cancel")}
      width={1200}
      className="top-8"
      styles={{ body: { maxHeight: "75vh", overflowY: "auto" } }}
    >
      <div className="space-y-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>
    </Modal>
  );
}
