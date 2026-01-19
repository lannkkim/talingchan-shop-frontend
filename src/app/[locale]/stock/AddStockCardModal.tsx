"use client";

import React, { useState } from "react";
import { Modal, InputNumber, Button, App, Typography } from "antd";
import { StockCard } from "@/types/stock";
import { Card } from "@/types/card";
import { createStockCard } from "@/services/stock";
import CardBrowser from "@/components/shared/CardBrowser";

const { Text } = Typography;

interface AddStockCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStockCardModal({
  visible,
  onClose,
  onSuccess,
}: AddStockCardModalProps) {
  const { message } = App.useApp();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleSelectCard = (cards: Card[]) => {
    // CardSelector returns an array
    if (cards.length > 0) {
      setSelectedCard(cards[0]);
    } else {
      setSelectedCard(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCard) {
      message.error("Please select a card");
      return;
    }

    try {
      setLoading(true);
      await createStockCard(selectedCard.card_id, quantity);
      message.success("Card added to stock");
      onSuccess();
      handleClose();
    } catch (error: any) {
        // Validation format: { errors: [{field, message}] } from backend
        // Standard axios error might hide it in response.data
        const msg = error.response?.data?.error || error.response?.data?.errors?.[0]?.message || "Failed to add card";
        message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCard(null);
    setQuantity(1);
    onClose();
  };

  return (
    <Modal
      title="Add Card to Stock"
      open={visible}
      onCancel={handleClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={!selectedCard}
        >
          Add to Stock
        </Button>,
      ]}
    >
      <div className="flex flex-col gap-4 h-[600px]">
        {selectedCard && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-center justify-between">
            <div>
              <Text strong>Selected: </Text>
              <Text>{selectedCard.name}</Text>
               <span className="mx-2 text-gray-300">|</span>
              <Text type="secondary">{selectedCard.rare}</Text>
            </div>
            <div className="flex items-center gap-2">
                <Text>Quantity:</Text>
                <InputNumber
                    min={1}
                    value={quantity}
                    onChange={(val) => setQuantity(val || 1)}
                 />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
            <Text type="secondary" className="mb-2">Select a card from the list:</Text>
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md p-2">
                 <CardBrowser
                    selectable={true}
                    multiple={false}
                    onSelect={handleSelectCard}
                    selectedCards={selectedCard ? [selectedCard] : []}
                  />
            </div>
        </div>
      </div>
    </Modal>
  );
}
