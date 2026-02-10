"use client";

import CardBrowser from "@/components/shared/CardBrowser";
import { FloatingLabelInput } from "@/components/shared/FloatingLabelInput";
import { FloatingLabelRangePicker } from "@/components/shared/FloatingLabelRangePicker";
import PageHeader from "@/components/shared/PageHeader";
import {
  createTrade,
  CreatePackageTradeInput,
} from "@/services/packages";
import { getMyInventory } from "@/services/stock";
import { Card as CardType } from "@/types/card";
import { getCardImageUrl } from "@/utils/image";
import { DeleteOutlined, PlusOutlined, SwapOutlined, DollarOutlined, FileTextOutlined } from "@ant-design/icons";
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
  Typography,
} from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

// Reusing the theme from ProductAddFormV2 for consistency
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

interface TradeAddFormProps {
  userId: string;
}

export default function TradeAddForm({ userId }: TradeAddFormProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const t = useTranslations("Market.Trade"); // Assuming translations exist or fallback

  const [form] = Form.useForm();
  
  // State for Card Selections
  // key 0: "Have"
  // key 1, 2, 3...: "Want Option 1", "Want Option 2"...
  const [selectedCardsMap, setSelectedCardsMap] = useState<Record<number, CardType[]>>({});
  const [activeFieldIndex, setActiveFieldIndex] = useState<number>(0);
  
  const selectedCards = selectedCardsMap[activeFieldIndex] || [];
  
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
      if (newWidth >= 300 && newWidth <= 600) {
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

  // Fetch inventory for "Have" section (index 0)
  const { data: inventory } = useQuery({
    queryKey: ["myInventory"],
    queryFn: getMyInventory,
  });

  // Prepare Available Cards for "Have" section
  const availableCards = useMemo(() => {
    if (activeFieldIndex === 0 && inventory) {
       return inventory
        .filter((stock) => stock.card)
        .map((stock) => ({
          ...stock.card!,
          stockQuantity: stock.quantity,
          stock_card_id: stock.stock_card_id,
        }));
    }
    return undefined; // Undefined means Global Mode (for Want sections)
  }, [inventory, activeFieldIndex]);

  const mutation = useMutation({
    mutationFn: (data: CreatePackageTradeInput) => createTrade(data),
    onSuccess: () => {
      message.success("สร้างรายการแลกเปลี่ยนสำเร็จ");
      queryClient.invalidateQueries({ queryKey: ["tradeProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/market/trade");
    },
    onError: (err: any) => {
      message.error("Failed to create trade: " + (err.response?.data?.error || err.message));
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const haveCards = selectedCardsMap[0] || [];
      if (haveCards.length === 0) {
        message.warning("กรุณาเลือกการ์ดที่คุณมี (Items You Have)");
        setActiveFieldIndex(0);
        return;
      }

      // Collect Want Options
      const wantItems = form.getFieldValue("want_items") || [];
      
      // REFACTOR: Re-build payload logic to include metadata
      const finalWantOptions = [];
      for (let i = 0; i < wantItems.length; i++) {
         const globalIndex = i + 1;
         const cards = selectedCardsMap[globalIndex] || [];
         const wantItemValues = values.want_items?.[i] || {};

         if (cards.length > 0) {
            finalWantOptions.push({
               cards: cards.map(c => ({
                  stock_card_id: c.card_id,
                  quantity: wantItemValues[`quantity_${c.card_id}`] || 1
               })),
               cash_wish: wantItemValues.cash_wish ? Number(wantItemValues.cash_wish) : undefined,
               wishlist_wish: wantItemValues.wishlist_wish,
            });
         }
      }

      if (finalWantOptions.length === 0) {
        message.warning("กรุณาเลือกสิ่งที่อยากได้ (Items You Want) อย่างน้อย 1 ตัวเลือก");
        return;
      }

      const finalPayload: CreatePackageTradeInput = {
        name: values.name,
        detail: values.description,
        started_at: values.effective_period?.[0]?.toISOString(),
        ended_at: values.effective_period?.[1]?.toISOString(),
        cash_trade: values.cash_trade ? Number(values.cash_trade) : undefined,
        wishlist_trade: values.wishlist_trade,
        have_cards: haveCards.map(c => ({
            stock_card_id: c.card_id,
            quantity: values[`quantity_have_${c.card_id}`] || 1
        })),
        want_options: finalWantOptions
      };

      mutation.mutate(finalPayload);

    } catch (err) {
      console.error("Validation Error:", err);
    }
  };

  const handleRemoveCard = (cardId: string, globalIndex: number) => {
    const currentCards = selectedCardsMap[globalIndex] || [];
    const newCards = currentCards.filter((c) => c.card_id !== cardId);
    setSelectedCardsMap(prev => ({ ...prev, [globalIndex]: newCards }));
  };

  return (
    <ConfigProvider theme={bottegaTheme}>
      <Layout className="min-h-screen bg-white">
        <PageHeader title="สร้างข้อเสนอแลกเปลี่ยน (Create Trade)" onBack={() => router.back()} />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            want_items: [{}] // Start with 1 want option
          }}
          className="h-full"
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

              <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                 {/* 1. Global Trade Info */}
                 <Card className="border-0 !rounded-none mb-4">
                    <Title level={4} className="!mb-4 uppercase tracking-[0.15em] text-sm">
                      ข้อมูลทั่วไป
                    </Title>
                    <Form.Item name="name" label="หัวข้อแลกเปลี่ยน" rules={[{ required: true }]}>
                       <FloatingLabelInput label="Trade Title" />
                    </Form.Item>
                    <Form.Item name="description" label="รายละเอียด">
                       <FloatingLabelInput label="Description" />
                    </Form.Item>
                    <Form.Item name="effective_period" label="ระยะเวลา" rules={[{ required: true, message: "กรุณาระบุระยะเวลา" }]}>
                       <FloatingLabelRangePicker label="Start - End Date" className="w-full" />
                    </Form.Item>
                 </Card>
                 
                 <Divider className="!my-2" />

                 {/* 2. Items You Have (Fixed Section - Index 0) */}
                 <Card 
                    className={`border transition-all duration-200 mb-4 ${activeFieldIndex === 0 ? 'border-black shadow-md ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                    styles={{ body: { padding: '16px' } }}
                    onClick={() => setActiveFieldIndex(0)}
                 >
                    <div className="flex justify-between items-center mb-4">
                       <Title level={5} className="!mb-0 text-sm font-bold text-gray-800">
                          items You Have (ของที่มี)
                       </Title>
                       <Text type="secondary" className="text-xs">Index 0</Text>
                    </div>
                    
                    {/* Toggles for Have Section */}
                    {/* Toggles for Have Section */}
                    {/* Use Form.Item shouldUpdate to safely read values for button styling without causing connection warning */ }
                    <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => (
                            <div className="flex gap-2 mb-4">
                                <Button 
                                    size="small" 
                                    type={getFieldValue("show_cash_trade") ? "primary" : "dashed"}
                                    icon={<DollarOutlined />}
                                    onClick={() => {
                                        const curr = getFieldValue("show_cash_trade");
                                        form.setFieldValue("show_cash_trade", !curr);
                                        // Force UI Update
                                        form.setFieldsValue({ show_cash_trade: !curr });
                                    }}
                                >
                                    Add Cash
                                </Button>
                                <Button 
                                    size="small" 
                                    type={getFieldValue("show_note_trade") ? "primary" : "dashed"}
                                    icon={<FileTextOutlined />}
                                    onClick={() => {
                                        const curr = getFieldValue("show_note_trade");
                                        form.setFieldValue("show_note_trade", !curr);
                                        form.setFieldsValue({ show_note_trade: !curr });
                                    }}
                                >
                                    Add Note
                                </Button>
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => getFieldValue("show_cash_trade") && (
                            <Form.Item name="cash_trade" label="เงินสดที่คุณให้ (Offer Cash)" className="mb-4 animate-in fade-in slide-in-from-top-1">
                                <FloatingLabelInput label="จำนวนเงิน (THB)" type="number" min={0} />
                            </Form.Item>
                        )}
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => getFieldValue("show_note_trade") && (
                            <Form.Item name="wishlist_trade" label="ข้อความเพิ่มเติม (Note)" className="mb-4 animate-in fade-in slide-in-from-top-1">
                                <FloatingLabelInput label="ระบุรายละเอียด (เช่น สภาพการ์ด)" type="textarea" rows={3} />
                            </Form.Item>
                        )}
                    </Form.Item>

                    <div className={`border-2 border-dashed rounded-lg p-2 text-center min-h-[100px] flex flex-col items-center justify-center cursor-pointer transition-colors ${activeFieldIndex === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                         {(selectedCardsMap[0] || []).length > 0 ? (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2 w-full">
                               {(selectedCardsMap[0] || []).map(card => (
                                  <div key={card.card_id} className="relative group">
                                     <div className="relative aspect-[3/4] w-full rounded overflow-hidden shadow-sm">
                                        <Image src={getCardImageUrl(card.image_name, "thumb")} className="w-full h-full object-cover" preview={false} />
                                        <Button
                                            size="small" type="text" danger icon={<DeleteOutlined />}
                                            className="absolute top-0 right-0 bg-white/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveCard(card.card_id, 0); }}
                                        />
                                     </div>
                                     <div className="text-[10px] mt-1 truncate font-medium">
                                        <Form.Item shouldUpdate noStyle>
                                           {({ getFieldValue }) => `x${getFieldValue(`quantity_have_${card.card_id}`) || 1}`}
                                        </Form.Item>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         ) : (
                            <Text type="secondary" className="text-xs">คลิกเพื่อเลือกการ์ดที่มี</Text>
                         )}
                    </div>
                 </Card>

                 <Divider className="!my-2" />
                 <Title level={4} className="!mb-4 uppercase tracking-[0.15em] text-sm mt-4">
                   Items You Want (สิ่งที่อยากได้)
                 </Title>

                 {/* 3. Items You Want (Dynamic List - Index 1+) */}
                 <Form.List name="want_items">
                    {(fields, { add, remove }) => (
                       <div className="space-y-4">
                          {fields.map((field, index) => {
                             const globalIndex = index + 1; // Map index = list index + 1
                             const isActive = activeFieldIndex === globalIndex;
                             
                             return (
                                <Card
                                  key={field.key}
                                  className={`border transition-all duration-200 ${isActive ? 'border-black shadow-md ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                                  styles={{ body: { padding: '16px' } }}
                                  onClick={() => setActiveFieldIndex(globalIndex)}
                                >
                                   <div className="flex justify-between items-center mb-4">
                                      <Title level={5} className="!mb-0 text-sm">Option {index + 1}</Title>
                                      {fields.length > 1 && (
                                         <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => {
                                            e.stopPropagation();
                                            remove(field.name);
                                            // Cleanup map? Optional but good practice.
                                            // Ideally we should shift keys but for simplicity we just remove and let user re-select if needed or just handle orphan keys.
                                            // The simplest way is to NOT shift map keys but rely on Form List order. 
                                            // Actually re-indexing map is complex.
                                            // Let's just reset map for this index for now, or live with logic complexity.
                                            // If I remove index 0 from list, index 1 becomes 0. But map key 2 stays 2? No.
                                            // To avoid bugs, maybe better to clear map or re-build it.
                                            // For V1, let's just warn or handle it simply:
                                            setSelectedCardsMap(prev => {
                                                const newMap: Record<number, CardType[]> = {};
                                                // Keep Have (0)
                                                if (prev[0]) newMap[0] = prev[0];
                                                
                                                // Re-index others
                                                // If we remove 'index' from fields, then field at index+1 becomes index.
                                                // So we need to shift map entries > globalIndex down by 1.
                                                Object.keys(prev).forEach(kStr => {
                                                    const k = Number(kStr);
                                                    if (k === 0) return;
                                                    if (k < globalIndex) newMap[k] = prev[k];
                                                    if (k > globalIndex) newMap[k - 1] = prev[k];
                                                });
                                                return newMap;
                                            });
                                            setActiveFieldIndex(0); // Reset focus
                                         }} />
                                      )}
                                   </div>
                                    
                                    {/* Thumbnails */}
                                   <div className={`border-2 border-dashed rounded-lg p-2 text-center min-h-[80px] flex flex-col items-center justify-center cursor-pointer transition-colors ${isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                       {(selectedCardsMap[globalIndex] || []).length > 0 ? (
                                          <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2 w-full">
                                             {(selectedCardsMap[globalIndex] || []).map(card => (
                                                <div key={card.card_id} className="relative group">
                                                    <div className="relative aspect-[3/4] w-full rounded overflow-hidden shadow-sm">
                                                        <Image src={getCardImageUrl(card.image_name, "thumb")} className="w-full h-full object-cover" preview={false} />
                                                        <Button
                                                            size="small" type="text" danger icon={<DeleteOutlined />}
                                                            className="absolute top-0 right-0 bg-white/80 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveCard(card.card_id, globalIndex); }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] mt-1 truncate">
                                                      <Form.Item shouldUpdate noStyle>
                                                          {({ getFieldValue }) => `x${getFieldValue(['want_items', index, `quantity_${card.card_id}`]) || 1}`}
                                                      </Form.Item>
                                                    </div>
                                                </div>
                                             ))}
                                          </div>
                                       ) : (
                                          <Text type="secondary" className="text-xs">เลือกสิ่งที่อยากได้</Text>
                                       )}
                                   </div>
                                    
                                    {/* Toggles for Want Option */}
                                    <div className="mt-4">
                                        <Form.Item shouldUpdate noStyle>
                                            {({ getFieldValue, setFieldValue }) => {
                                                const showCash = getFieldValue(['want_items', index, 'show_cash_wish']);
                                                const showNote = getFieldValue(['want_items', index, 'show_note_wish']);
                                                
                                                return (
                                                    <div className="space-y-3">
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                size="small" 
                                                                type={showCash ? "primary" : "dashed"}
                                                                icon={<DollarOutlined />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFieldValue(['want_items', index, 'show_cash_wish'], !showCash);
                                                                    if(showCash) setFieldValue(['want_items', index, 'cash_wish'], undefined);
                                                                }}
                                                            >
                                                                Request Cash
                                                            </Button>
                                                            <Button 
                                                                size="small" 
                                                                type={showNote ? "primary" : "dashed"}
                                                                icon={<FileTextOutlined />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFieldValue(['want_items', index, 'show_note_wish'], !showNote);
                                                                    if(showNote) setFieldValue(['want_items', index, 'wishlist_wish'], undefined);
                                                                }}
                                                            >
                                                                Add Note
                                                            </Button>
                                                        </div>

                                                        {showCash && (
                                                            <div onClick={e => e.stopPropagation()}>
                                                                <Form.Item name={[field.name, "cash_wish"]} label="เงินที่คุณขอเพิ่ม (Request Cash)" className="mb-0 animate-in fade-in">
                                                                    <FloatingLabelInput label="จำนวนเงิน (THB)" type="number" min={0} />
                                                                </Form.Item>
                                                            </div>
                                                        )}

                                                        {showNote && (
                                                            <div onClick={e => e.stopPropagation()}>
                                                                <Form.Item name={[field.name, "wishlist_wish"]} label="รายละเอียดเพิ่มเติม (Note)" className="mb-0 animate-in fade-in">
                                                                    <FloatingLabelInput label="ระบุสิ่งที่อยากได้ (เช่น สภาพการ์ด)" type="textarea" rows={3} />
                                                                </Form.Item>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        </Form.Item>
                                    </div>
                                </Card>
                             );
                          })}
                          
                          <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()} disabled={fields.length >= 3}>
                             เพิ่มทางเลือก (Add Option)
                          </Button>
                       </div>
                    )}
                 </Form.List>

                 <Divider className="!my-2" />
                 

                 <div className="h-20" /> {/* Spacer */}
                 
                 <div className="sticky bottom-0 bg-white pt-4 pb-0 border-t border-gray-100">
                    <Button type="primary" block size="large" onClick={handleSubmit} loading={mutation.isPending} className="!bg-black hover:!bg-gray-800 !border-none">
                       สร้างข้อเสนอ (Create Trade)
                    </Button>
                 </div>
              </div>
            </Sider>

            <Content className="p-6 bg-gray-50/30" style={{ minHeight: "calc(100vh - 113px)" }}>
                {activeFieldIndex >= 0 ? (
                     <CardBrowser
                        key={activeFieldIndex} // Force re-mount when switching sections to clear/reset View if needed, or keeping it is fine but might be confusing. Re-mount ensures cleanliness.
                        selectedCards={selectedCardsMap[activeFieldIndex] || []}
                        onSelect={(cards) => setSelectedCardsMap(prev => ({ ...prev, [activeFieldIndex]: cards as CardType[] }))}
                        multiple
                        availableCards={availableCards} // Only defined for index 0
                        renderCustomActions={(card, isSelected) => isSelected && (
                           <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-200">
                              {activeFieldIndex === 0 ? (
                                 // Have Items (Global Field Name)
                                 <Form.Item
                                    name={`quantity_have_${card.card_id}`}
                                    initialValue={1}
                                    className="!mb-0"
                                    rules={[{ required: true }]}
                                 >
                                    <InputNumber min={1} className="w-full" placeholder="Qty" size="small" />
                                 </Form.Item>
                              ) : (
                                 // Want Items (Array Field Name)
                                 // GlobalIndex 1 -> Want Item Index 0
                                 <Form.Item
                                    name={['want_items', activeFieldIndex - 1, `quantity_${card.card_id}`]}
                                    initialValue={1}
                                    className="!mb-0"
                                    rules={[{ required: true }]}
                                 >
                                    <InputNumber min={1} className="w-full" placeholder="Qty" size="small" />
                                 </Form.Item>
                              )}
                           </div>
                        )}
                     />
                ) : (
                   <div className="h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                         <SwapOutlined className="text-4xl mb-4 opacity-50" />
                         <p>เลือกหัวข้อทางซ้ายมือเพื่อเริ่มจัดการการ์ด</p>
                      </div>
                   </div>
                )}
            </Content>
          </Layout>
        </Form>
      </Layout>
    </ConfigProvider>
  );
}
