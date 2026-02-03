"use client";

import CardBrowser from "@/components/shared/CardBrowser";
import { FloatingLabelInput } from "@/components/shared/FloatingLabelInput";
import { FloatingLabelRangePicker } from "@/components/shared/FloatingLabelRangePicker";
import PageHeader from "@/components/shared/PageHeader";
import {
  checkStock,
  createProduct,
  CreateProductInput,
} from "@/services/product";
import { getMyShop } from "@/services/shop";
import { getMyInventory } from "@/services/stock";
import {
  getBuyTypes,
  getSellTypes,
  getTransactionTypes,
  getTypes,
} from "@/services/type";
import { Card as CardType } from "@/types/card";
import { getCardImageUrl } from "@/utils/image";
import { ArrowRightOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  ConfigProvider,
  Divider,
  Form,
  Image,
  InputNumber,
  Layout,
  Select,
  Typography,
} from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const bottegaTheme = {
  token: {
    borderRadius: 0,
    colorPrimary: "#000000",
    fontFamily: "var(--font-inter)",
    colorText: "#000000",
    colorBgContainer: "#ffffff",
    colorBorder: "#e5e5e5",
  },
  components: {
    Button: {
      borderRadius: 0,
      controlHeight: 48,
      fontWeight: 500,
      primaryColor: "#ffffff",
      defaultBorderColor: "#000000",
      defaultColor: "#000000",
    },
    Input: {
      borderRadius: 0,
      controlHeight: 48,
      activeBorderColor: "#000000",
      hoverBorderColor: "#000000",
    },
    InputNumber: {
      borderRadius: 0,
      controlHeight: 48,
      activeBorderColor: "#000000",
      hoverBorderColor: "#000000",
    },
    Select: {
      borderRadius: 0,
      controlHeight: 48,
      colorPrimary: "#000000",
      controlItemBgActive: "#f5f5f5",
    },
    Card: {
      borderRadius: 0,
      boxShadow: "none",
    },
    Form: {
      labelColor: "#000000",
      labelFontSize: 12,
    },
    Typography: {
      fontFamily: "var(--font-inter)",
    },
  },
};

// Product Type interface
interface ProductType {
  product_type_id: string;
  name: string;
  code?: string;
}

interface ProductAddFormV2Props {
  transactionType: "sell" | "buy";
  onSuccess?: () => void;
}

export default function ProductAddFormV2({
  transactionType,
  onSuccess,
}: ProductAddFormV2Props) {
  const router = useRouter();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const t = useTranslations("Shop.productForm");

  const [selectedType, setSelectedType] = useState<ProductType | null>(null);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [form] = Form.useForm();

  const isSingle = selectedType?.name === "แยกใบ";
  const isBundle = selectedType?.name === "ประเภทเดี่ยว";

  // Auto-fill product name based on card selection
  React.useEffect(() => {
    if (selectedCards.length > 0) {
      const card = selectedCards[0];

      if (isSingle) {
        const autoName = `${card.name} ${card.rare}`.trim();
        form.setFieldValue("name", autoName);
      } else if (isBundle) {
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

  // Fetch shop profile for stock check (only for sell orders)
  const { data: shopProfile } = useQuery({
    queryKey: ["myShop"],
    queryFn: getMyShop,
    enabled: transactionType === "sell",
  });

  const shouldCheckStock =
    shopProfile?.is_stock_check_enabled && transactionType === "sell";

  // Fetch inventory conditionally
  const { data: inventory } = useQuery({
    queryKey: ["myInventory"],
    queryFn: getMyInventory,
    enabled: shouldCheckStock,
  });

  // Create filtered card list with stock quantities
  const availableCards = useMemo(() => {
    if (shouldCheckStock && inventory) {
      return inventory
        .filter((stock) => stock.card)
        .map((stock) => ({
          ...stock.card!,
          stockQuantity: stock.quantity,
          stock_card_id: stock.stock_card_id,
        }));
    }
    return null;
  }, [shouldCheckStock, inventory]);

  // Calculate max product quantity based on stock
  const maxProductQuantity = useMemo(() => {
    if (!shouldCheckStock || !selectedCards.length) return undefined;

    let minMax = Infinity;
    selectedCards.forEach((card) => {
      const cardQty = form.getFieldValue(`quantity_${card.card_id}`) || 1;
      const stockQty = (card as CardType & { stockQuantity?: number })
        .stockQuantity;
      if (stockQty !== undefined) {
        const maxProducts = Math.floor(stockQty / cardQty);
        minMax = Math.min(minMax, maxProducts);
      }
    });

    return minMax === Infinity ? undefined : minMax;
  }, [shouldCheckStock, selectedCards, form]);

  const mutation = useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: () => {
      message.success(t("messages.success"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/products");
      }
    },
    onError: (error: Error) => {
      message.error(t("messages.error", { error: error.message }));
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedType) {
        message.warning("กรุณาเลือกประเภทสินค้า");
        return;
      }

      if (selectedCards.length === 0) {
        message.warning(t("messages.selectCard"));
        return;
      }

      const transactionTypeSelection =
        transactionType === "sell" ? "sell_order" : "buy_order";

      let transactionTypeId: string | undefined;
      let sellTypeId: string | undefined;
      let buyTypeId: string | undefined;

      if (transactionTypeSelection === "sell_order") {
        transactionTypeId = transactionTypes.find(
          (t) => t.code === "sell",
        )?.transaction_type_id;
        sellTypeId = sellTypes.find(
          (t) => t.code === "sell_order",
        )?.sell_type_id;
      } else if (transactionTypeSelection === "buy_order") {
        transactionTypeId = transactionTypes.find(
          (t) => t.code === "buy",
        )?.transaction_type_id;
        buyTypeId = buyTypes.find((t) => t.code === "buy_order")?.buy_type_id;
      }

      // Check Stock if Sell Order
      if (transactionType === "sell") {
        try {
          const stockCheckPayload = selectedCards.map((c) => ({
            stock_card_id: c.card_id,
            quantity: form.getFieldValue(`quantity_${c.card_id}`) || 1,
          }));

          await checkStock(stockCheckPayload);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          message.error(
            t("messages.stockCheckFailed", {
              error: errorMessage,
            }),
          );
          return;
        }
      }

      // Extract dates from RangePicker
      const [startDate, endDate] = values.effective_period || [];

      const payload: CreateProductInput = {
        name: values.name,
        detail: values.detail,
        type_id: selectedType.product_type_id,
        transaction_type_id: transactionTypeId,
        sell_type_id: sellTypeId,
        buy_type_id: buyTypeId,
        // Map effective dates to started_at/ended_at
        started_at: startDate?.toISOString(),
        ended_at: endDate?.toISOString(),
        cards: selectedCards.map((c) => ({
          stock_card_id: c.card_id,
          quantity: values[`quantity_${c.card_id}`] || 1,
        })),
        // Simplification: only sending price. Deposit/Profit removed.
        price: values.price
          ? {
              price: values.price,
              price_period_ended: endDate?.toISOString(), // Optional mapping
            }
          : undefined,
        quantity: values.quantity,
      };

      mutation.mutate(payload);
    } catch (err) {
      console.error("Validation failed", err);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter((c) => c.card_id !== cardId));
  };

  const handleCardQuantityChange = (cardId: string, quantity: number) => {
    form.setFieldValue(`quantity_${cardId}`, quantity);
  };

  // Get selected type options for the dropdown
  const typeOptions = useMemo(() => {
    return types.map((t: ProductType) => ({
      value: t.product_type_id,
      label: t.name,
    }));
  }, [types]);

  return (
    <ConfigProvider theme={bottegaTheme}>
      <Layout className="min-h-screen bg-white">
        {/* Main PageHeader with navigation */}
        <PageHeader title="เพิ่มสินค้า" backUrl="/shop" />

        {/* Secondary action bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-16 z-20">
          <Text type="secondary">
            {selectedCards.length > 0
              ? `เลือกแล้ว ${selectedCards.length} รายการ`
              : "ยังไม่ได้เลือกสินค้า"}
          </Text>
          {/* <Button icon={<FilterOutlined />}>ตัวกรอง และ จัดกลุ่ม</Button> */}
        </div>

        <Layout className="bg-white">
          {/* Left Sidebar - Form */}
          <Sider
            width={360}
            className="!bg-white border-r border-gray-200 p-0"
            style={{
              height: "calc(100vh - 113px)",
              position: "sticky",
              top: 113,
              overflow: "auto",
            }}
          >
            <div className="p-6">
              <Card className="border-0 border-r border-gray-200 !rounded-none">
                <Title
                  level={4}
                  className="!mb-8 uppercase tracking-[0.15em] text-sm"
                >
                  ตั้งสินค้าขาย
                </Title>

                <Form
                  form={form}
                  layout="vertical"
                  preserve={true}
                  onValuesChange={(changedValues) => {
                    if (isBundle && selectedCards.length > 0) {
                      const card = selectedCards[0];
                      const qtyKey = `quantity_${card.card_id}`;

                      if (qtyKey in changedValues) {
                        const qty = changedValues[qtyKey];
                        const autoName =
                          `ชุด ${card.name} ${card.rare} ${qty} ใบ`.trim();
                        form.setFieldValue("name", autoName);
                      }
                    }
                  }}
                  className="uppercase-labels"
                >
                  {/* Product Type Dropdown */}
                  <Form.Item label="ประเภทสินค้า" className="!mb-4">
                    <Select
                      placeholder="เลือกประเภท"
                      value={selectedType?.product_type_id}
                      onChange={(value) => {
                        const newType = types.find(
                          (t: ProductType) => t.product_type_id === value,
                        );
                        if (newType) {
                          setSelectedType(newType);
                          // Reset selections when changing type
                          if (isSingle || isBundle) {
                            setSelectedCards([]);
                          }
                        }
                      }}
                      options={typeOptions}
                      loading={loadingTypes}
                      size="large"
                    />
                  </Form.Item>

                  {/* Selected Cards List */}
                  <div className="mb-4">
                    <Text strong className="text-gray-600 text-sm">
                      รายการสินค้า
                    </Text>
                    <div className="mt-2 flex gap-2 flex-wrap min-h-[80px] border border-dashed border-gray-200 rounded-lg p-3">
                      {selectedCards.length === 0 ? (
                        <div className="w-full flex items-center justify-center text-gray-400 text-sm">
                          เลือกการ์ดจากด้านขวา
                        </div>
                      ) : (
                        selectedCards.map((card) => (
                          <div key={card.card_id} className="relative group">
                            <div className="w-16 relative">
                              <Image
                                src={getCardImageUrl(card.image_name)}
                                alt={card.name}
                                className="object-cover !rounded-none"
                                preview={false}
                                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDEwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
                              />
                              <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                size="small"
                                className="!absolute !top-0 !right-0 !bg-red-500 !text-white !rounded-full !w-5 !h-5 !min-w-0 !p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveCard(card.card_id)}
                              />
                              <div className="text-center mt-1">
                                <Text className="text-[10px] text-gray-600 line-clamp-1 block">
                                  {card.name}
                                </Text>
                                <Text className="text-[10px] text-orange-500">
                                  {card.rare}
                                </Text>
                                <div className="flex items-center justify-center mt-1">
                                  <Text className="text-[10px] text-gray-400 mr-1">
                                    x
                                  </Text>
                                  <InputNumber
                                    size="small"
                                    min={1}
                                    defaultValue={1}
                                    className="!w-10 !text-xs"
                                    onChange={(val) =>
                                      handleCardQuantityChange(
                                        card.card_id,
                                        val || 1,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {selectedCards.length > 0 && (
                        <div className="w-16 h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                          <ArrowRightOutlined className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <Divider className="!my-4" />

                  {/* Product Name */}
                  <Form.Item
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: t("basicInfo.errors.requiredName"),
                      },
                    ]}
                    className="!mb-8 border-none"
                  >
                    <FloatingLabelInput
                      label="ชื่อสินค้า"
                      placeholder=""
                      disabled={isSingle}
                    />
                  </Form.Item>

                  {/* Quantity */}
                  <Form.Item
                    name="quantity"
                    initialValue={1}
                    rules={[
                      {
                        required: true,
                        message: t("basicInfo.errors.requiredQuantity"),
                      },
                    ]}
                    className="!mb-8 border-none"
                  >
                    <FloatingLabelInput
                      label="จำนวนสินค้า"
                      type="number"
                      className="!w-full"
                      placeholder=""
                      min={1}
                      max={maxProductQuantity}
                    />
                  </Form.Item>

                  <Divider className="!my-4" />

                  {/* Price Section */}
                  <div className="grid grid-cols-1 gap-2">
                    <Form.Item
                      name="price"
                      className="!mb-8 border-none"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <FloatingLabelInput
                        label="ราคา (บาท/ชุด)"
                        type="number"
                        className="!w-full"
                        placeholder=""
                        min={0}
                      />
                    </Form.Item>

                    {/* Effective Date */}
                    <Form.Item
                      name="effective_period"
                      className="!mb-8 border-none"
                    >
                      <FloatingLabelRangePicker label="ระยะเวลาที่มีผล" />
                    </Form.Item>
                  </div>

                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={handleSubmit}
                    loading={mutation.isPending}
                    className="!mt-8 uppercase tracking-widest !h-12 !bg-black hover:!bg-gray-800 !border-none !rounded-none"
                  >
                    ส่งเพื่อตรวจสอบ
                  </Button>
                </Form>
              </Card>
            </div>
          </Sider>

          {/* Right Content - Card Browser */}
          <Content className="p-6" style={{ minHeight: "calc(100vh - 113px)" }}>
            <CardBrowser
              selectedCards={selectedCards}
              onSelect={setSelectedCards}
              multiple={!isSingle && !isBundle}
              availableCards={availableCards}
              renderCustomActions={(card: CardType, isSelected: boolean) =>
                isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-200">
                    <Form.Item
                      name={`quantity_${card.card_id}`}
                      initialValue={1}
                      className="!mb-0"
                      rules={[{ required: true, message: "" }]}
                    >
                      {isSingle ? (
                        <div className="text-center text-gray-500 text-sm py-1">
                          {t("selection.qty")}: 1
                          <div style={{ display: "none" }}>
                            <InputNumber value={1} />
                          </div>
                        </div>
                      ) : (
                        <InputNumber
                          min={1}
                          max={(() => {
                            const stockQty = (
                              card as CardType & { stockQuantity?: number }
                            ).stockQuantity;
                            const productQty =
                              form.getFieldValue("quantity") || 1;
                            return stockQty
                              ? Math.floor(stockQty / productQty)
                              : undefined;
                          })()}
                          className="w-full"
                          placeholder={t("selection.qty")}
                          prefix={
                            <Text type="secondary" className="mr-1 text-xs">
                              {t("selection.qty")}:
                            </Text>
                          }
                        />
                      )}
                    </Form.Item>
                  </div>
                )
              }
            />
          </Content>
        </Layout>
      </Layout>
      <style jsx global>{`
        .ant-form-item-explain-error {
          font-size: 10px !important;
          margin-top: 2px !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </ConfigProvider>
  );
}
