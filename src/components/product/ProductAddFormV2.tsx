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
import { ArrowRightOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
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
  Checkbox,
  DatePicker,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";

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

interface ProductType {
  product_type_id: string;
  name: string;
  code?: string;
}

interface ProductAddFormV2Props {
  transactionType: "sell" | "buy";
  onSuccess?: () => void;
}

const SellSummary = ({ form }: { form: any }) => {
  const items = Form.useWatch("items", form) || [];

  // Calculate totals
  const totalQty = items.reduce((acc: number, item: any) => acc + (Number(item?.quantity) || 0), 0);
  const totalPrice = items.reduce((acc: number, item: any) => acc + ((Number(item?.quantity) || 0) * (Number(item?.price) || 0)), 0);

  return (
    <div className="space-y-2">
      <Title level={5} className="!mb-2 text-sm">สรุปยอดรวม</Title>
      <div className="flex justify-between text-sm">
        <Text type="secondary">จำนวนสินค้าทั้งหมด</Text>
        <Text strong>{totalQty.toLocaleString()} ชิ้น</Text>
      </div>
      <div className="flex justify-between text-sm">
        <Text type="secondary">ราคารวมโดยประมาณ</Text>
        <Text strong className="text-green-600">{totalPrice.toLocaleString()} THB</Text>
      </div>
      <div className="text-xs text-gray-400 mt-2 text-center">
        * ราคานี้ยังไม่รวมค่าธรรมเนียม
      </div>
    </div>
  );
};

const AuctionSummary = ({ form }: { form: any }) => {
  const items = Form.useWatch("items", form) || [];
  const startDate = Form.useWatch("auction_start_date", form);
  const endDate = Form.useWatch("auction_end_date", form);
  const isAutoExtend = Form.useWatch("is_auto_extend", form);
  const extendTrigger = Form.useWatch("auto_extend_trigger_min", form) || 5;
  const extendDuration = Form.useWatch("auto_extend_duration_min", form) || 5;
  const extendMax = Form.useWatch("auto_extend_max_count", form);

  const duration = useMemo(() => {
    if (!startDate || !endDate) return "-";
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diffMin = end.diff(start, 'minute');
    const days = Math.floor(diffMin / 1440);
    const hours = Math.floor((diffMin % 1440) / 60);
    const mins = diffMin % 60;

    let text = "";
    if (days > 0) text += `${days} วัน `;
    if (hours > 0) text += `${hours} ชม. `;
    if (mins > 0) text += `${mins} นาที`;
    return text || "-";
  }, [startDate, endDate]);

  const maxEndDate = useMemo(() => {
    if (!endDate || !isAutoExtend) return null;
    if (extendMax > 0) {
      return dayjs(endDate).add(extendDuration * extendMax, 'minute');
    }
    return null; // Unlimited
  }, [endDate, isAutoExtend, extendDuration, extendMax]);

  return (
    <div className="space-y-4">
      <div>
        <Title level={5} className="!mb-2 text-sm">สรุประยะเวลาการประมูล</Title>
        <div className="bg-white p-3 rounded border border-gray-200 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">เริ่ม:</span>
            <span>{startDate ? dayjs(startDate).format("DD/MM/YYYY HH:mm") : "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">สิ้นสุด:</span>
            <span>{endDate ? dayjs(endDate).format("DD/MM/YYYY HH:mm") : "-"}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-dashed">
            <span className="text-gray-500">ระยะเวลารวม:</span>
            <span className="font-medium text-blue-600">{duration}</span>
          </div>
        </div>
      </div>

      <div>
        <Title level={5} className="!mb-2 text-sm">เงื่อนไขราคาและสินค้า</Title>
        <div className="bg-white p-3 rounded border border-gray-200 espacio-y-2 text-xs">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="mb-2 pb-2 last:mb-0 last:pb-0 border-b border-gray-100 last:border-0">
              <div className="font-bold truncate mb-1">{idx + 1}. {item?.name || "สินค้าใหม่"}</div>
              <div className="flex justify-between pl-2">
                <span className="text-gray-500">ราคาเริ่มต้น:</span>
                <span>{Number(item?.price || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pl-2">
                <span className="text-gray-500">บิทขั้นต่ำ:</span>
                <span>{Number(item?.bid_increment || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAutoExtend && (
        <div>
          <Title level={5} className="!mb-2 text-sm">Auto-Extend (ต่อเวลาอัตโนมัติ)</Title>
          <div className="bg-orange-50 p-3 rounded border border-orange-100 text-xs text-orange-800 space-y-1">
            <div>• หากมีผู้บิทในช่วง <b>{extendTrigger} นาทีสุดท้าย</b></div>
            <div>• เวลาจะถูกต่อเพิ่ม <b>{extendDuration} นาที</b></div>
            <div>
              • {extendMax > 0
                ? <span>ต่อได้สูงสุด <b>{extendMax} ครั้ง</b> <span className="block text-orange-600/70 text-[10px]">(จบช้าสุดประมาณ {maxEndDate?.format("DD/MM HH:mm")})</span></span>
                : "ไม่จำกัดจำนวนครั้ง"}
            </div>
          </div>
        </div>
      )}

      <div className="text-[10px] text-gray-400 border-t pt-2 space-y-1">
        <div>* ไม่สามารถแก้ไขเวลาประมูลหลังเริ่มแล้ว</div>
        <div>* ไม่สามารถยกเลิกการประมูลเมื่อมีผู้บิทแล้ว</div>
        <div>* การบิทถือเป็นข้อผูกมัดตามกติกา</div>
      </div>
    </div>
  );
};

export default function ProductAddFormV2({
  transactionType,
  onSuccess,
}: ProductAddFormV2Props) {
  const router = useRouter();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const t = useTranslations("Shop.productForm");

  // State for Multi-Product Support
  const [selectedCardsMap, setSelectedCardsMap] = useState<Record<number, CardType[]>>({});
  const [activeFieldIndex, setActiveFieldIndex] = useState<number>(0);
  const selectedCards = selectedCardsMap[activeFieldIndex] || [];
  const [saleType, setSaleType] = useState<"sell" | "auction">("sell");
  const [form] = Form.useForm();

  // Queries (Moved up to fix scoping)
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

  // Watch the active product type
  const activeTypeId = Form.useWatch(['items', activeFieldIndex, 'type_id'], form);

  // Derive Type info from the active item
  const selectedType = useMemo(() =>
    types.find(t => t.product_type_id === activeTypeId) || null
    , [types, activeTypeId]);

  const isSingle = selectedType?.name === "แยกใบ";
  const isBundle = selectedType?.name === "ประเภทเดี่ยว";

  // Resizable Sider State
  const [siderWidth, setSiderWidth] = useState(360);
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= 250 && newWidth <= 600) {
        setSiderWidth(newWidth);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Auto-fill product name based on card selection
  React.useEffect(() => {
    if (selectedCards.length > 0) {
      const card = selectedCards[0];
      const currentName = form.getFieldValue(["items", activeFieldIndex, "name"]);

      if (isSingle) {
        const autoName = `${card.name} ${card.rare}`.trim();
        if (currentName !== autoName) {
          form.setFieldValue(["items", activeFieldIndex, "name"], autoName);
        }
      } else if (isBundle) {
        const qty = form.getFieldValue(["items", activeFieldIndex, `quantity_${card.card_id}`]) || 1;
        const autoName = `ชุด ${card.name} ${card.rare} ${qty} ใบ`.trim();
        if (currentName !== autoName) {
          form.setFieldValue(["items", activeFieldIndex, "name"], autoName);
        }
      }
    }
  }, [selectedCards, isSingle, isBundle, form, activeFieldIndex]);

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
      const itemPath = ["items", activeFieldIndex, `quantity_${card.card_id}`];
      const cardQty = form.getFieldValue(itemPath) || 1;

      const stockQty = (card as CardType & { stockQuantity?: number })
        .stockQuantity;
      if (stockQty !== undefined) {
        const maxProducts = Math.floor(stockQty / cardQty);
        minMax = Math.min(minMax, maxProducts);
      }
    });

    return minMax === Infinity ? undefined : minMax;
  }, [shouldCheckStock, selectedCards, form, activeFieldIndex]);

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
      const items = values.items || [];

      if (!items || items.length === 0) {
        message.warning("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
        return;
      }

      // Validate all items have cards
      for (let i = 0; i < items.length; i++) {
        const cards = selectedCardsMap[i] || [];
        if (cards.length === 0) {
          message.warning(`สินค้าชุดที่ ${i + 1} เขายังไม่ได้เลือกการ์ด`);
          setActiveFieldIndex(i);
          return;
        }
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

        // Determine Sell Type ID based on selected saleType
        if (saleType === "sell") {
          sellTypeId = sellTypes.find(
            (t) => t.code === "sell_order"
          )?.sell_type_id;
        } else if (saleType === "auction") {
          sellTypeId = sellTypes.find(
            (t) => t.code === "auction_order"
          )?.sell_type_id;

          if (!sellTypeId) {
            sellTypeId = sellTypes.find(
              (t) => t.code === "auction"
            )?.sell_type_id;
          }
        }
      } else if (transactionTypeSelection === "buy_order") {
        transactionTypeId = transactionTypes.find(
          (t) => t.code === "buy",
        )?.transaction_type_id;
        buyTypeId = buyTypes.find((t) => t.code === "buy_order")?.buy_type_id;
      }

      if (transactionType === "sell") {
        const allStockChecks: { stock_card_id: string; quantity: number }[] = [];

        items.forEach((item: any, index: number) => {
          const cards = selectedCardsMap[index] || [];
          cards.forEach(c => {
            allStockChecks.push({
              stock_card_id: c.card_id,
              quantity: item[`quantity_${c.card_id}`] || 1
            });
          });
        });

        if (allStockChecks.length > 0) {
          try {
            await checkStock(allStockChecks);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            message.error(t("messages.stockCheckFailed", { error: errorMessage }));
            return;
          }
        }
      }

      // Create Payloads
      const payloads: CreateProductInput[] = items.map((item: any, index: number) => {
        const cards = selectedCardsMap[index] || [];

        let itemStart, itemEnd;

        if (saleType === "auction") {
          itemStart = values.auction_start_date?.toISOString();
          itemEnd = values.auction_end_date?.toISOString();
        } else {
          const [s, e] = item.effective_period || [];
          itemStart = s?.toISOString();
          itemEnd = e?.toISOString();
        }

        return {
          name: item.name,
          detail: item.detail,
          type_id: item.type_id,
          transaction_type_id: transactionTypeId,
          sell_type_id: sellTypeId,
          buy_type_id: buyTypeId,
          started_at: itemStart,
          ended_at: itemEnd,
          cards: cards.map((c) => ({
            stock_card_id: c.card_id,
            quantity: item[`quantity_${c.card_id}`] || 1,
          })),
          price: item.price
            ? {
              price: item.price,
              price_period_ended: itemEnd,
            }
            : undefined,
          quantity: item.quantity,

          is_auto_extend: values.is_auto_extend,
          auto_extend_trigger_min: values.is_auto_extend ? values.auto_extend_trigger_min : undefined,
          auto_extend_duration_min: values.is_auto_extend ? values.auto_extend_duration_min : undefined,
          auto_extend_max_count: values.is_auto_extend ? values.auto_extend_max_count : undefined,
          bid_increment: item.bid_increment,
        };
      });

      await Promise.all(payloads.map(p => mutation.mutateAsync(p)));

    } catch (err) {
      console.error("Validation failed", err);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    const currentCards = selectedCardsMap[activeFieldIndex] || [];
    const newCards = currentCards.filter((c) => c.card_id !== cardId);
    setSelectedCardsMap(prev => ({ ...prev, [activeFieldIndex]: newCards }));
  };

  const typeOptions = useMemo(() => {
    return types.map((t: ProductType) => ({
      value: t.product_type_id,
      label: t.name,
    }));
  }, [types]);

  return (
    <ConfigProvider theme={bottegaTheme}>
      <Layout className="min-h-screen bg-white">
        <PageHeader title="เพิ่มสินค้า" />

        {/* Secondary action bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-16 z-20">
          <Text type="secondary">
            {selectedCards.length > 0
              ? `รายการที่ ${activeFieldIndex + 1}: เลือกแล้ว ${selectedCards.length} ใบ`
              : `รายการที่ ${activeFieldIndex + 1}: ยังไม่ได้เลือกสินค้า`}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          preserve={true}
          initialValues={{
            items: [{ bid_increment: 10, quantity: 1 }],
            saleType: "sell"
          }}
          onValuesChange={(changedValues) => {
            if (changedValues.saleType) {
              setSaleType(changedValues.saleType);
            }
            if (isBundle && selectedCards.length > 0) {
              // Check if it's a quantity update
              // Logic simplified: we might need to verify which item updated
              // But since we use useWatch/useEffect for name, maybe we don't need this onValuesChange here?
              // Let's keep it safe.
            }
          }}
          className="uppercase-labels h-full"
        >
          <Layout className="bg-white h-full">
            <Sider
              width={siderWidth}
              className="!bg-white border-r border-gray-200 p-0 relative"
              style={{
                height: "calc(100vh - 113px)",
                position: "sticky",
                top: 113,
                overflow: "visible",
              }}
            >
              {/* Resize Handle */}
              <div
                className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 hover:bg-blue-400 transition-colors opacity-0 hover:opacity-100 active:opacity-100 active:bg-blue-600"
                style={{ transform: "translateX(50%)" }}
                onMouseDown={startResizing}
              />

              <div className="p-6 h-full overflow-y-auto">
                {/* Global Settings */}
                <Card className="border-0 !rounded-none mb-4">
                  <Title level={4} className="!mb-4 uppercase tracking-[0.15em] text-sm">
                    ตั้งสินค้าขาย
                  </Title>
                  {/* Sale Type Selection - Global */}
                  <Form.Item
                    label={<span className="text-base font-bold text-gray-800">ประเภทการขาย</span>}
                    className="!mb-6 p-4 rounded-lg"
                    name="saleType"
                  >
                    <div className="flex flex-row gap-6 mt-2">
                      <Checkbox
                        checked={saleType === "sell"}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSaleType("sell");
                            form.setFieldValue("saleType", "sell");
                          }
                        }}
                        className="scale-110"
                      >
                        <span className="font-medium text-gray-700">ตั้งขาย</span>
                      </Checkbox>
                      <Checkbox
                        checked={saleType === "auction"}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSaleType("auction");
                            form.setFieldValue("saleType", "auction");
                          }
                        }}
                        className="scale-110"
                      >
                        <span className="font-medium text-gray-700">ประมูล</span>
                      </Checkbox>
                    </div>
                  </Form.Item>

                  {/* Global Auction Settings */}
                  {saleType === "auction" && (
                    <div className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                      <Title level={5} className="!mb-4 text-sm">ตั้งค่าเวลาประมูล (ใช้ร่วมกัน)</Title>
                      <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="auction_start_date" label="เริ่มประมูล" rules={[{ required: true, message: "Required" }]}>
                          <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full" />
                        </Form.Item>
                        <Form.Item name="auction_end_date" label="จบประมูล" rules={[{ required: true, message: "Required" }]}>
                          <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full" />
                        </Form.Item>
                      </div>

                      <Divider className="!my-2" />

                      {/* Auto Extend Global */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Auto-Extend</span>
                        <Form.Item name="is_auto_extend" valuePropName="checked" noStyle>
                          <Switch size="small" />
                        </Form.Item>
                      </div>
                      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.is_auto_extend !== curr.is_auto_extend}>
                        {({ getFieldValue }) => getFieldValue("is_auto_extend") && (
                          <div className="grid grid-cols-3 gap-2">
                            <Form.Item name="auto_extend_trigger_min" label="Trigger (min)" initialValue={5}><InputNumber className="w-full" /></Form.Item>
                            <Form.Item name="auto_extend_duration_min" label="Extend (min)" initialValue={5}><InputNumber className="w-full" /></Form.Item>
                            <Form.Item name="auto_extend_max_count" label="Max Count" initialValue={0}><InputNumber className="w-full" /></Form.Item>
                          </div>
                        )}
                      </Form.Item>
                    </div>
                  )}
                </Card>

                {/* Product Items List */}
                <Form.List name="items">
                  {(fields, { add, remove }) => (
                    <div className="space-y-6">
                      {fields.map((field, index) => {
                        const isActive = index === activeFieldIndex;

                        return (
                          <Card
                            key={field.key}
                            className={`border transition-all duration-200 ${isActive ? 'border-black shadow-md ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                            onClick={() => setActiveFieldIndex(index)}
                            styles={{ body: { padding: '16px' } }}
                          >
                            <div className="flex justify-between items-center mb-4">
                              <Title level={5} className="!mb-0 text-sm">สินค้าชุดที่ {index + 1}</Title>
                              {fields.length > 1 && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    remove(field.name);
                                    setSelectedCardsMap(prev => {
                                      const newMap: Record<number, CardType[]> = {};
                                      Object.keys(prev).forEach(k => {
                                        const kNum = Number(k);
                                        if (kNum < index) newMap[kNum] = prev[kNum];
                                        if (kNum > index) newMap[kNum - 1] = prev[kNum];
                                      });
                                      return newMap;
                                    });
                                    if (activeFieldIndex >= index && activeFieldIndex > 0) {
                                      setActiveFieldIndex(activeFieldIndex - 1);
                                    } else if (activeFieldIndex === index) {
                                      setActiveFieldIndex(0);
                                    }
                                  }}
                                />
                              )}
                            </div>

                            {/* Product Type (Per Item) */}
                            <Form.Item
                              name={[field.name, "type_id"]}
                              label="ประเภทสินค้า"
                              rules={[{ required: true, message: "Required" }]}
                            >
                              <Select placeholder="เลือกประเภท" options={typeOptions} />
                            </Form.Item>

                            {/* Selected Cards Display */}
                            <Form.Item label="รายการสินค้า" required>
                              <div className={`border-2 border-dashed rounded-lg p-4 text-center min-h-[100px] flex flex-col items-center justify-center cursor-pointer transition-colors ${isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                {(selectedCardsMap[index] || []).length > 0 ? (
                                  <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 w-full">
                                    {(selectedCardsMap[index] || []).map(card => (
                                      <div key={card.card_id} className="relative group">
                                        <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                          <Image
                                            src={getCardImageUrl(card.image_name)}
                                            className="w-full h-full object-cover"
                                            preview={false}
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                          <Button
                                            size="small"
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            className="absolute top-1 right-1 bg-white/80 hover:bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveCard(card.card_id);
                                            }}
                                          />
                                        </div>
                                        <div className="text-center mt-2">
                                          <div className="text-xs font-bold truncate">{card.name}</div>
                                          <div className="text-[10px] text-gray-500">
                                            <Form.Item shouldUpdate noStyle>
                                              {({ getFieldValue }) => {
                                                const qty = getFieldValue(['items', index, `quantity_${card.card_id}`]) || 1;
                                                return `x ${qty}`;
                                              }}
                                            </Form.Item>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <Text type="secondary" className="text-xs">
                                    {isActive ? "เลือกการ์ดจากด้านขวา" : "คลิกเพื่อเลือกสินค้า"}
                                  </Text>
                                )}
                              </div>
                            </Form.Item>

                            {/* Name */}
                            <Form.Item name={[field.name, "name"]} label="ชื่อสินค้า" rules={[{ required: true }]}>
                              <FloatingLabelInput label="ชื่อสินค้า" disabled={isSingle && isActive} />
                            </Form.Item>

                            {/* Quantity */}
                            <Form.Item name={[field.name, "quantity"]} label="จำนวนสินค้า" rules={[{ required: true }]} initialValue={1}>
                              <FloatingLabelInput label="จำนวนสินค้า" type="number" min={1} />
                            </Form.Item>

                            <Divider className="!my-4" />

                            {/* Price & Bid/Date Row */}
                            <div className="grid grid-cols-2 gap-4">
                              <Form.Item name={[field.name, "price"]} rules={[{ required: true }]}>
                                <FloatingLabelInput
                                  label={`${saleType === "auction" ? "ราคาตั้งต้น" : "ราคา"}*`}
                                  type="number"
                                />
                              </Form.Item>

                              {saleType === "auction" ? (
                                <Form.Item name={[field.name, "bid_increment"]} rules={[{ required: true }]} initialValue={10}>
                                  <FloatingLabelInput label="บิทขั้นต่ำ*" type="number" />
                                </Form.Item>
                              ) : (
                                <Form.Item name={[field.name, "effective_period"]}>
                                  <FloatingLabelRangePicker label="วันที่ขาย" className="w-full" />
                                </Form.Item>
                              )}
                            </div>

                          </Card>
                        )
                      })}

                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large" className="h-12">
                        เพิ่มรายการสินค้า
                      </Button>
                    </div>
                  )}
                </Form.List>


                <div className="mt-8 bg-gray-50 border border-gray-100 rounded-lg p-4">
                  {saleType === "auction" ? (
                    <AuctionSummary form={form} />
                  ) : (
                    <SellSummary form={form} />
                  )}

                  {saleType === "auction" && (
                    <Form.Item
                      name="accept_terms"
                      valuePropName="checked"
                      rules={[{
                        validator: (_, value) =>
                          value ? Promise.resolve() : Promise.reject(new Error('กรุณายอมรับเงื่อนไข'))
                      }]}
                      className="mt-4"
                    >
                      <Checkbox>ข้าพเจ้ารับทราบและยอมรับเงื่อนไขการประมูล</Checkbox>
                    </Form.Item>
                  )}
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleSubmit}
                  loading={mutation.isPending}
                  className="!mt-4 uppercase tracking-widest !h-12 !bg-black hover:!bg-gray-800 !border-none !rounded-none"
                >
                  ส่งเพื่อตรวจสอบ
                </Button>
              </div>
            </Sider>

            {/* Right Content - Card Browser */}
            <Content className="p-6" style={{ minHeight: "calc(100vh - 113px)" }}>
              <CardBrowser
                selectedCards={selectedCardsMap[activeFieldIndex] || []}
                onSelect={(cards) => setSelectedCardsMap(prev => ({ ...prev, [activeFieldIndex]: cards }))}
                multiple={!isSingle && !isBundle}
                availableCards={availableCards}
                renderCustomActions={(card, isSelected) => isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100">
                    <Form.Item
                      name={['items', activeFieldIndex, `quantity_${card.card_id}`]}
                      initialValue={1}
                      className="!mb-0"
                    >
                      <InputNumber min={1} className="w-full" placeholder="จำนวน" />
                    </Form.Item>
                  </div>
                )}
              />
            </Content>
          </Layout>
        </Form>
      </Layout>
    </ConfigProvider>
  );
}
