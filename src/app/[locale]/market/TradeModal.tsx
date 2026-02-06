import React, { useState } from "react";
import { Modal, Row, Col, Typography, Tabs, Button, Form, Input, App, Tag, InputNumber } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card as CardType } from "@/types/card";
import { createTrade, CreatePackageTradeInput } from "@/services/packages"; // New Service
import CardBrowser from "@/components/shared/CardBrowser";
import { SwapOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface TradeModalProps {
  open: boolean;
  onCancel: () => void;
  userId: string;
}

export default function TradeModal({ open, onCancel, userId }: TradeModalProps) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  // State
  const [haveCards, setHaveCards] = useState<CardType[]>([]);
  const [wantOptions, setWantOptions] = useState<CardType[][]>([[], [], []]); // 3 options
  const [activeTab, setActiveTab] = useState("0");

  const mutation = useMutation({
    mutationFn: (data: CreatePackageTradeInput) => createTrade(data),
    onSuccess: () => {
      message.success("Trade request created successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onCancel();
      // Reset state
      setHaveCards([]);
      setWantOptions([[], [], []]);
      form.resetFields();
    },
    onError: (err: any) => {
        message.error("Failed to create trade: " + (err.response?.data?.error || err.message));
    }
  });

  const handleSubmit = async () => {
    if (haveCards.length === 0) {
        message.error("Please select items you have to trade.");
        return;
    }
    
    // Check if at least one want option has cards
    const hasWants = wantOptions.some(opt => opt.length > 0);
    if (!hasWants) {
        message.error("Please select at least one item you want.");
        return;
    }

    try {
        const values = await form.validateFields();
        
        const payload: CreatePackageTradeInput = {
            name: values.name,
            detail: values.description,
            have_cards: haveCards.map(c => ({
                stock_card_id: c.card_id, 
                quantity: form.getFieldValue(`have_qty_${c.card_id}`) || 1 
            })),
            want_options: wantOptions
                .map((opt, i) => ({ opt, i }))
                .filter(({ opt }) => opt.length > 0)
                .map(({ opt, i }) => opt.map(c => ({
                     stock_card_id: c.card_id, 
                     quantity: form.getFieldValue(`want_qty_${i}_${c.card_id}`) || 1
                }))),
        };
        
        mutation.mutate(payload);

    } catch (err) {
        console.error(err);
    }
  };

  const WantTabContent = ({ index }: { index: number }) => (
    <div className="h-[400px] overflow-hidden flex flex-col bg-white border border-gray-200 rounded-b-lg border-t-0 p-2">
       <CardBrowser
          selectedCards={wantOptions[index]}
          onSelect={(newSelection) => {
              const newOpts = [...wantOptions];
              newOpts[index] = newSelection as CardType[];
              setWantOptions(newOpts);
          }}
          multiple
          renderCustomActions={(card: CardType, isSelected: boolean) =>
             isSelected && (
               <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-200">
                 <Form.Item
                   name={`want_qty_${index}_${card.card_id}`}
                   initialValue={1}
                   className="!mb-0"
                   rules={[{ required: true, message: "" }]}
                 >
                   <InputNumber
                     min={1}
                     className="w-full"
                     placeholder="Qty"
                     size="small"
                     prefix={<Text type="secondary" className="mr-1 text-xs">x</Text>}
                   />
                 </Form.Item>
               </div>
             )
          }
          // Global browser
       />
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={<div className="flex items-center gap-2"><SwapOutlined className="text-blue-500"/> Create Trade Request</div>}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={mutation.isPending}>
          Create Trade
        </Button>
      ]}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical">
         <Form.Item name="name" label="Trade Title" rules={[{ required: true, message: "Please enter a title" }]}>
             <Input placeholder="e.g. Trading Blue Eyes for Dark Magician" />
         </Form.Item>
         <Form.Item name="description" label="Description">
             <Input.TextArea placeholder="Any specific conditions?" />
         </Form.Item>

         <Row gutter={24} className="h-[500px]">
            {/* Left: Have (Global Selection) */}
            <Col span={12} className="h-full flex flex-col">
               <div className="bg-gray-50 p-3 rounded-t-xl border border-gray-200 mb-2 flex justify-between items-center">
                  <Text strong className="text-gray-700">Items You Have</Text>
                  <Tag color="geekblue">{haveCards.length} Selected</Tag>
               </div>
               <Tabs
                 type="card"
                 className="flex-1"
                 items={[{
                    key: 'inventory',
                    label: 'Inventory',
                    children: (
                       <div className="h-[400px] overflow-hidden flex flex-col bg-white border border-gray-200 rounded-b-lg border-t-0 p-2">
                         <CardBrowser
                            selectedCards={haveCards}
                            onSelect={(selection) => setHaveCards(selection as CardType[])}
                            multiple
                            renderCustomActions={(card: CardType, isSelected: boolean) =>
                               isSelected && (
                                 <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-200">
                                   <Form.Item
                                     name={`have_qty_${card.card_id}`}
                                     initialValue={1}
                                     className="!mb-0"
                                     rules={[{ required: true, message: "" }]}
                                   >
                                     <InputNumber
                                       min={1}
                                       className="w-full"
                                       placeholder="Qty"
                                       size="small"
                                       prefix={<Text type="secondary" className="mr-1 text-xs">x</Text>}
                                     />
                                   </Form.Item>
                                 </div>
                               )
                            }
                         />
                       </div>
                    )
                 }]}
               />
            </Col>

            {/* Right: Want (Global) */}
            <Col span={12} className="h-full flex flex-col">
               <div className="bg-gray-50 p-3 rounded-t-xl border border-gray-200 mb-2">
                  <Text strong className="text-gray-700">Items You Want</Text>
               </div>
               <Tabs
                 activeKey={activeTab}
                 onChange={setActiveTab}
                 type="card"
                 className="flex-1"
                 items={[0, 1, 2].map(i => ({
                   key: String(i),
                   label: `Option ${i + 1} (${wantOptions[i].length})`,
                   children: <WantTabContent index={i} />,
                 }))}
               />
            </Col>
         </Row>
      </Form>
    </Modal>
  );
}
