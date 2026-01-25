import React, { useState, useEffect } from "react";
import { Modal, Form, InputNumber, Typography, Button, message, Alert } from "antd";
import { StockCard } from "@/types/stock";
import { updateStock } from "@/services/stock"; // Assume updateStock service exists mapping to PUT /stock-cards/:id
import { useQueryClient } from "@tanstack/react-query";

const { Text } = Typography;

interface AdjustStockModalProps {
  visible: boolean;
  onClose: () => void;
  stockCard: StockCard | null;
  onSuccess: () => void;
}

export default function AdjustStockModal({
  visible,
  onClose,
  stockCard,
  onSuccess,
}: AdjustStockModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [totalStock, setTotalStock] = useState<number>(0);
  
  // Available Stock (DB Quantity)
  const available = stockCard?.quantity || 0;
  // Unit Use (In Orders)
  const unitUse = stockCard?.unit_use || 0;

  useEffect(() => {
    if (visible && stockCard) {
      // Logic: User thinks in terms of "Total Stock".
      // Total = Available + Unit Use
      const currentTotal = (stockCard.quantity || 0) + (stockCard.unit_use || 0);
      setTotalStock(currentTotal);
      form.setFieldsValue({ total: currentTotal });
    }
  }, [visible, stockCard, form]);

  const handleSubmit = async () => {
    if (!stockCard) return;
    try {
      const values = await form.validateFields();
      setLoading(true);

      const newTotal = values.total;
      
      // Validation: Total cannot be less than Unit Use
      if (newTotal < unitUse) {
          message.error(`Total stock cannot be less than In Use amount (${unitUse})`);
          setLoading(false);
          return;
      }

      // Calculate new Available Stock to save to DB
      const newAvailable = newTotal - unitUse;

      await updateStock(stockCard.stock_card_id, { quantity: newAvailable });

      message.success("Stock adjusted successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.message || "Failed to adjust stock");
    } finally {
      setLoading(false);
    }
  };

  const currentAvailable = totalStock >= unitUse ? totalStock - unitUse : 0;

  return (
    <Modal
      title={`Adjust Stock: ${stockCard?.card?.name || ""}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Save
        </Button>,
      ]}
      destroyOnHidden
    >
      <div className="mb-4">
          <div className="flex justify-between mb-2">
              <Text type="secondary">In Use (Locked in Orders):</Text>
              <Text strong>{unitUse}</Text>
          </div>
           <div className="flex justify-between mb-4">
              <Text type="secondary">Current Available:</Text>
              <Text>{available}</Text>
          </div>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="total"
          label="Total Stock (In Hand)"
          help={`New Available will be: ${currentAvailable}`}
          rules={[
            { required: true, message: "Please enter total stock" },
            () => ({
                validator(_, value) {
                  if (value < unitUse) {
                    return Promise.reject(new Error(`Minimum allowed is ${unitUse} (In Use)`));
                  }
                  return Promise.resolve();
                },
              }),
          ]}
        >
          <InputNumber
            className="w-full"
            min={unitUse}
            placeholder="Enter total quantity"
            onChange={(val) => setTotalStock(val || 0)}
          />
        </Form.Item>
      </Form>
      
      {stockCard && unitUse > 0 && (
          <Alert 
            type="info" 
            showIcon 
            title={<span className="font-semibold">Stock Protection</span>}
            description={`You have ${unitUse} units currently in active/pending orders. You cannot reduce total stock below this amount.`}
            className="mt-2"
            />
      )}
    </Modal>
  );
}
