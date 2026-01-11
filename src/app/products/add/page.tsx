"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTypes, getTransactionTypes, getSellTypes, getBuyTypes } from "@/services/type";
import { createProduct, CreateProductInput, checkStock } from "@/services/product";
import { Card as CardType } from "@/types/card";
import CardSelector from "@/components/shared/CardSelector";
import CardBrowser from "@/components/shared/CardBrowser";
import { 
  Layout, Typography, Button, Steps, Card, Row, Col, 
  Form, Input, InputNumber, DatePicker, App, Space, Result, Divider, Tag, Radio 
} from "antd";
import { 
  ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, 
  FileTextOutlined, SelectOutlined, SettingOutlined 
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function AddProductPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [mainTypeSelection, setMainTypeSelection] = useState<"single" | "set" | null>(null);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [form] = Form.useForm();
  
  const isSingle = selectedType?.name === "แยกใบ";
  const isBundle = selectedType?.name === "ประเภทเดี่ยว"; // Bundle (Set of Single Type)

  React.useEffect(() => {
    if (selectedCards.length > 0) {
      const card = selectedCards[0];
      
      if (isSingle) {
        // Single Type: Auto-fill name and lock it
        const autoName = `${card.name} ${card.rare}`.trim();
        form.setFieldValue("name", autoName);
      } else if (isBundle) {
        // Bundle Type: Auto-fill name but keep editable
        // Get current quantity for this card
        const qty = form.getFieldValue(`quantity_${card.card_id}`) || 1;
        const autoName = `ชุด ${card.name} ${card.rare} ${qty} ใบ`.trim();
        form.setFieldValue("name", autoName);
      }
    }
  }, [selectedCards, isSingle, isBundle, form]);

  const { data: types = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["types"],
    queryFn: getTypes,
  });

  const { data: transactionTypes = [] } = useQuery({
    queryKey: ["transactionTypes"],
    queryFn: getTransactionTypes,
  });

  const { data: sellTypes = [] } = useQuery({
    queryKey: ["sellTypes"],
    queryFn: getSellTypes,
  });

  const { data: buyTypes = [] } = useQuery({
    queryKey: ["buyTypes"],
    queryFn: getBuyTypes,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: () => {
      message.success("Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/products");
    },
    onError: (error: any) => {
      message.error(`Failed to create product: ${error.message}`);
    }
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const transactionTypeSelection = values.transaction_type_selection; // "sell_order" or "buy_order"
      
      let transactionTypeId: number | undefined;
      let sellTypeId: number | undefined;
      let buyTypeId: number | undefined;

      if (transactionTypeSelection === "sell_order") {
        transactionTypeId = transactionTypes.find(t => t.code === "sell")?.transaction_type_id;
        sellTypeId = sellTypes.find(t => t.code === "sell_order")?.sell_type_id;
      } else if (transactionTypeSelection === "buy_order") {
        transactionTypeId = transactionTypes.find(t => t.code === "buy")?.transaction_type_id;
        buyTypeId = buyTypes.find(t => t.code === "buy_order")?.buy_type_id;
      }

      const payload: CreateProductInput = {
        name: values.name,
        detail: values.detail,
        type_id: selectedType.product_type_id,
        // Transaction Types
        transaction_type_id: transactionTypeId,
        sell_type_id: sellTypeId,
        buy_type_id: buyTypeId,
        
        started_at: values.started_at?.toISOString(),
        ended_at: values.ended_at?.toISOString(),
        cards: selectedCards.map(c => ({
          stock_card_id: c.card_id,
          quantity: values[`quantity_${c.card_id}`] || 1,
        })),
        price: values.price ? {
          price: values.price,
          price_period_ended: values.price_period_ended?.toISOString(),
        } : undefined,
        quantity: values.quantity, // Add product quantity
      };

      mutation.mutate(payload);
    } catch (err) {
      console.error("Validation failed", err);
    }
  };

  const steps = [
    { title: "Select Type", icon: <SelectOutlined /> },
    { title: "Configuration", icon: <SettingOutlined /> },
    { title: "Review", icon: <FileTextOutlined /> },
  ];

  const renderTypeSelection = () => {
    if (loadingTypes) {
      return (
        <Row gutter={[24, 24]} className="mt-8">
           {[...Array(3)].map((_, i) => (
            <Col key={i} xs={24} sm={12} md={8}>
              <Card loading />
            </Col>
          ))}
        </Row>
      );
    }

    return (
      <Row gutter={[24, 24]} className="mt-8 justify-center">
        {/* Option 1: Separate Card (Single) */}
        <Col xs={24} sm={12} md={8}>
           <Card 
            hoverable
            className="text-center h-full transition-all duration-300 border-2 border-transparent hover:border-blue-500 hover:bg-blue-50/10"
            onClick={() => {
              const singleType = types.find((t: any) => t.name === "แยกใบ");
              if (singleType) {
                setMainTypeSelection("single");
                setSelectedType(singleType);
                setSelectedCards([]);
                setCurrentStep(1); 
              } else {
                 message.error("Product Type 'แยกใบ' not found");
              }
            }}
          >
            <div className="py-8">
              <Title level={4} className="!mb-2">แยกใบ</Title>
              <Paragraph type="secondary" className="mb-0">
                Create a listing for a single specific card.
              </Paragraph>
              <Button className="mt-6">Select This Type</Button>
            </div>
          </Card>
        </Col>

        {/* Option 2: Set (Bundle/Deck) */}
        <Col xs={24} sm={12} md={8}>
           <Card 
            hoverable
            className="text-center h-full transition-all duration-300 border-2 border-transparent hover:border-purple-500 hover:bg-purple-50/10"
            onClick={() => {
              const defaultSetType = types.find((t: any) => t.name === "ประเภทเดี่ยว");
              if (defaultSetType) {
                  setMainTypeSelection("set");
                  setSelectedType(defaultSetType); // Default to Single Type
                  setSelectedCards([]);
                  setCurrentStep(1);
              } else {
                  // Fallback if 'ประเภทเดี่ยว' missing (shouldn't happen with seed)
                   const anySetType = types.find((t: any) => t.name === "หลายประเภท");
                   if (anySetType) {
                      setMainTypeSelection("set");
                      setSelectedType(anySetType);
                      setSelectedCards([]);
                      setCurrentStep(1);
                   } else {
                      message.error("Set types not found");
                   }
              }
            }}
          >
            <div className="py-8">
              <Title level={4} className="!mb-2">ชุด</Title>
              <Paragraph type="secondary" className="mb-0">
                Create a collection or deck with multiple cards.
              </Paragraph>
              <Button className="mt-6">Select This Type</Button>
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  const { user } = useAuth();
  const canSell = user?.permissions?.includes("product:create:sell");

  const renderConfiguration = () => {
    const isSingle = selectedType?.name === "แยกใบ";
    const isBundle = selectedType?.name === "ประเภทเดี่ยว";
    
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-gray-50/50 p-6 border-b border-gray-100">
            <Title level={4} className="!mb-0">Basic Information</Title>
            <Text type="secondary">Tell us about your product</Text>
          </div>
          <div className="p-6">
              <Row gutter={24}>
                {mainTypeSelection === "set" && (
                  <Col span={24}>
                    <Form.Item label="Set Type" required>
                      <Radio.Group 
                        value={selectedType?.product_type_id} 
                        onChange={(e) => {
                           const newType = types.find((t: any) => t.product_type_id === e.target.value);
                           if (newType) {
                              setSelectedType(newType);
                              setSelectedCards([]); // Clear cards on type change
                           }
                        }}
                        className="w-full"
                        size="large"
                      >
                      {types.filter((t: any) => t.name === "ประเภทเดี่ยว" || t.name === "หลายประเภท").map((t: any) => (
                            <Radio.Button key={t.product_type_id} value={t.product_type_id} className="w-1/2 text-center">
                              {t.name}
                            </Radio.Button>
                         ))}
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                )}
                <Col span={24}>
                  <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                    <Input 
                      placeholder="e.g. Rare Dracomon Deck" 
                      size="large" 
                      disabled={isSingle}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item 
                    name="transaction_type_selection" 
                    label="Transaction Type" 
                    initialValue={canSell ? "sell_order" : "buy_order"}
                    rules={[{ required: true, message: "Please select a transaction type" }]}
                  >
                    <Radio.Group size="large" className="w-full">
                      <Row gutter={16}>
                        {canSell && (
                          <Col span={12}>
                            <Radio.Button value="sell_order" className="w-full text-center">
                              Sell Order (ตั้งขาย)
                            </Radio.Button>
                          </Col>
                        )}
                        <Col span={canSell ? 12 : 24}>
                          <Radio.Button value="buy_order" className="w-full text-center">
                            Buy Order (ตั้งรับ)
                          </Radio.Button>
                        </Col>
                      </Row>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="price" label="Base Price (Optional)">
                    <InputNumber 
                      prefix="฿" 
                      className="w-full" 
                      placeholder="0.00" 
                      size="large"
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="quantity" label="Product Quantity" initialValue={1} rules={[{ required: true, message: "Please enter product quantity" }]}>
                    <InputNumber 
                      className="w-full" 
                      placeholder="1" 
                      size="large"
                      min={1}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="price_period_ended" label="Price Valid Until (Optional)">
                    <DatePicker className="w-full" size="large" showTime />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="started_at" label="Product Active From" initialValue={null}>
                    <DatePicker className="w-full" size="large" showTime placeholder="Immediately" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="ended_at" label="Product Active Until" initialValue={null}>
                    <DatePicker className="w-full" size="large" showTime placeholder="Indefinite" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="detail" label="Description">
                    <Input.TextArea rows={3} placeholder="Describe your collection or product..." />
                  </Form.Item>
                </Col>
              </Row>
          </div>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <Title level={4} className="!mb-0">Card Selection</Title>
              <Text type="secondary">
                {(isSingle || isBundle) ? "Choose 1 specific card type for this product" : "Select one or more cards"}
              </Text>
            </div>
            <Tag color="blue">{selectedCards.length} Cards Selected</Tag>
          </div>
          <div className="p-6">
            <CardBrowser 
              selectedCards={selectedCards}
              onSelect={setSelectedCards}
              multiple={!isSingle && !isBundle}
              renderCustomActions={(card: CardType, isSelected: boolean) => isSelected && (
                <div 
                  className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-200"
                >
                  <Form.Item 
                    name={`quantity_${card.card_id}`} 
                    initialValue={1} 
                    className="!mb-0"
                    rules={[{ required: true, message: '' }]}
                  >
                     {isSingle ? (
                        <div className="text-center text-gray-500 text-sm py-1">
                          Qty: 1
                          <div style={{ display: 'none' }}>
                            <InputNumber value={1} />
                          </div>
                        </div>
                     ) : (
                        <InputNumber 
                          min={1} 
                          className="w-full" 
                          placeholder="Qty"
                          prefix={<Text type="secondary" className="mr-1 text-xs">Qty:</Text>}
                        />
                     )}
                  </Form.Item>
                </div>
              )}
            />
          </div>
        </Card>

      </div>
    );
  };

  const renderReview = () => (
    <div className="max-w-2xl mx-auto py-10">
      <Result
        icon={<CheckOutlined className="text-blue-500" />}
        title="Ready to Create"
        subTitle="Please review the details before finalizing your product."
      />
      
      <Card className="bg-gray-50 border-gray-100 mt-6">
        <Title level={5}>Summary</Title>
        <Divider className="my-3" />
        <Row className="mb-3">
          <Col span={10}><Text type="secondary">Name:</Text></Col>
          <Col span={14}><Text strong>{form.getFieldValue("name")}</Text></Col>
        </Row>
        <Row className="mb-3">
          <Col span={10}><Text type="secondary">Type:</Text></Col>
          <Col span={14}><Tag color="blue">{selectedType?.name}</Tag></Col>
        </Row>
        <Row className="mb-3">
          <Col span={10}><Text type="secondary">Cards:</Text></Col>
          <Col span={14}><Text>{selectedCards.length} items</Text></Col>
        </Row>
        {form.getFieldValue("price") && (
          <>
            <Row className="mb-3">
              <Col span={10}><Text type="secondary">Base Price:</Text></Col>
              <Col span={14}><Text strong>฿{form.getFieldValue("price").toLocaleString()}</Text></Col>
            </Row>
            {form.getFieldValue("price_period_ended") && (
              <Row className="mb-3">
                <Col span={10}><Text type="secondary">Price Until:</Text></Col>
                <Col span={14}><Text>{form.getFieldValue("price_period_ended").format("YYYY-MM-DD HH:mm")}</Text></Col>
              </Row>
            )}
          </>
        )}
        <Divider className="my-3" />
        <Row className="mb-3">
          <Col span={10}><Text type="secondary">Started At:</Text></Col>
          <Col span={14}>
            <Text>{form.getFieldValue("started_at") ? form.getFieldValue("started_at").format("YYYY-MM-DD HH:mm") : "Immediately"}</Text>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col span={10}><Text type="secondary">Ended At:</Text></Col>
          <Col span={14}>
            <Text>{form.getFieldValue("ended_at") ? form.getFieldValue("ended_at").format("YYYY-MM-DD HH:mm") : "Indefinite"}</Text>
          </Col>
        </Row>
      </Card>
    </div>
  );

  return (
    <Layout className="min-h-screen bg-white">
      <Header className="bg-white border-b border-gray-100 flex items-center px-8 h-20">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => {
             if (currentStep > 0) {
                setCurrentStep(currentStep - 1);
             } else {
                router.back();
             }
          }}
          className="mr-6 border-none shadow-none hover:bg-gray-50"
        >
          Back
        </Button>
        <div>
          <Title level={4} className="!mb-0">
            {currentStep === 0 ? "Add New Product" : `Step ${currentStep + 1}: ${steps[currentStep].title}`}
          </Title>
        </div>
      </Header>

      <Content className="p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <Form 
            form={form} 
            layout="vertical" 
            preserve={true}
            onValuesChange={(changedValues) => {
               // Handle real-time updates for Bundle auto-naming
               if (isBundle && selectedCards.length > 0) {
                 const card = selectedCards[0];
                 const qtyKey = `quantity_${card.card_id}`;
                 
                 // If quantity changed, update name
                 if (qtyKey in changedValues) {
                    const qty = changedValues[qtyKey]; // New quantity
                    const autoName = `ชุด ${card.name} ${card.rare} ${qty} ใบ`.trim();
                    form.setFieldValue("name", autoName);
                 }
               }
            }}
          >
            <div className="mb-12">
              <Steps 
                current={currentStep} 
                items={steps}
                className="max-w-3xl mx-auto"
              />
            </div>

            {currentStep === 0 && (
              <div className="animate-in fade-in duration-300">
                {renderTypeSelection()}
              </div>
            )}
            
            {/* 
              We use display: none for the configuration step to keep the form fields mounted 
              and preserve their values when navigating to the review step.
            */}
            <div style={{ display: currentStep === 1 ? "block" : "none" }}>
              {renderConfiguration()}
            </div>

            {currentStep === 2 && (
              <div className="animate-in fade-in duration-300">
                {renderReview()}
              </div>
            )}

          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-6 flex justify-center z-20">
            <Space size="large" className="w-full max-w-5xl justify-between px-8">
              <Button 
                size="large" 
                onClick={() => {
                  if (currentStep > 0) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    router.back();
                  }
                }}
                disabled={mutation.isPending}
              >
                {currentStep === 0 ? "Cancel" : "Previous Step"}
              </Button>
              
              {currentStep < 2 ? (
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ArrowRightOutlined />}
                  onClick={async () => {
                    if (currentStep === 1) {
                      if (!form.getFieldValue("name")) {
                        message.warning("Please enter a product name");
                        return;
                      }
                      if (selectedCards.length === 0) {
                        message.warning("Please select at least one card");
                        return;
                      }

                      // Check Stock if Sell Order
                      const transactionType = form.getFieldValue("transaction_type_selection");
                      if (transactionType === "sell_order") {
                        try {
                          const stockCheckPayload = selectedCards.map(c => ({
                            stock_card_id: c.card_id,
                            quantity: form.getFieldValue(`quantity_${c.card_id}`) || 1,
                          }));
                          
                          // Show loading somehow? For now blocking await is ok
                          await checkStock(stockCheckPayload);
                        } catch (err: any) {
                          message.error(`Stock check failed: ${err.response?.data?.error || err.message}`);
                          return; // Stop navigation
                        }
                      }
                    }
                    setCurrentStep(currentStep + 1);
                  }}
                  disabled={currentStep === 0 && !selectedType}
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<CheckOutlined />}
                  onClick={handleSubmit}
                  loading={mutation.isPending}
                >
                  Save Product
                </Button>
              )}
            </Space>
          </div>
        </Form>
        </div>
      </Content>
    </Layout>
  );
}
