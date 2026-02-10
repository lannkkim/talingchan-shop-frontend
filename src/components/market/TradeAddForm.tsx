"use client";

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
   Form,
   Button,
   Input,
   InputNumber,
   Typography,
   Card,
   Divider,
   Layout,
   ConfigProvider,
   Switch,
   Tag,
   Space,
   Badge,
   Collapse,
   DatePicker,
   Select
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
   PlusOutlined,
   CloseOutlined,
   DeleteOutlined,
   InfoCircleOutlined,
   WarningOutlined,
   CheckCircleOutlined,
   CaretRightOutlined,
   DownOutlined
} from "@ant-design/icons";
import { FloatingLabelInput } from "@/components/shared/FloatingLabelInput";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Link } from "@/navigation";

import { createTrade, CreatePackageTradeInput } from "@/services/packages";
import { getMyInventory } from "@/services/stock";
import { Card as CardType } from "@/types/card";
import { getCardImageUrl } from "@/utils/image";
import CardBrowser from "@/components/shared/CardBrowser";
import PageHeader from "@/components/shared/PageHeader";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Sider, Content } = Layout;

// --- Theme ---
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
      },
      Card: {
         borderRadius: 0,
         boxShadow: "none",
      },
      Select: {
         borderRadius: 0,
         controlHeight: 48,
      },
      Collapse: {
         borderRadius: 0,
         headerBg: "#ffffff",
         contentBg: "#ffffff"
      }
   },
};

// --- Types ---

interface OfferItem {
   id: string;
   product: CardType;
   quantity: number;
}

interface OfferSectionState {
   id: string;
   type: 'card' | 'bot'; // Merged single/set into card
   items: OfferItem[];
   isCollapsed: boolean;
}

interface RequestItemState {
   id: string;
   type: "BUNDLE" | "TEXT";
   // If Bundle
   bundleSections?: OfferSectionState[];
   bundleCash?: number;
   maxSections?: number; // Control sections per item
   // If TEXT
   bullets?: string[];
   isCollapsed: boolean;
}

interface TradeState {
   info: {
      name: string;
      range: [Dayjs | null, Dayjs | null] | null;
      forceCentral: boolean;
   };
   offer: {
      sections: OfferSectionState[];
   };
   want: RequestItemState[];
}

type SelectionContext = {
   target: 'OFFER' | 'REQUEST';
   requestId?: string; // If target REQUEST
   sectionId?: string; // If target OFFER
}

const { RangePicker } = DatePicker;

// Utility to get image url safely
const getImageUrl = (product: CardType) => product.image_name ? getCardImageUrl(product.image_name) : "";

export default function TradeAddForm() {
   const router = useRouter();
   const queryClient = useQueryClient();

   // --- State ---
   const [tradeState, setTradeState] = useState<TradeState>({
      info: { name: "", range: null, forceCentral: true },
      offer: { sections: [] },
      want: []
   });

   const [collapsedSections, setCollapsedSections] = useState({ offer: false, request: false });

   const [activeSelection, setActiveSelection] = useState<SelectionContext | null>(null);
   const [siderWidth, setSiderWidth] = useState(480);
   const isResizing = useRef(false);

   // --- Handlers ---
   const startResizing = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResizing);
   }, []);

   const resize = useCallback((e: MouseEvent) => {
      if (isResizing.current) {
         setSiderWidth(prev => Math.max(300, Math.min(800, e.clientX)));
      }
   }, []);

   const stopResizing = useCallback(() => {
      isResizing.current = false;
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResizing);
   }, []);

   // 1. Info Handlers
   const updateInfo = (updates: Partial<TradeState['info']>) => {
      setTradeState(prev => ({ ...prev, info: { ...prev.info, ...updates } }));
   };

   // 2. Section Management Helpers
   const addSectionToContainer = (
      containerType: 'OFFER' | 'REQUEST',
      sectionType: 'card' | 'bot',
      requestId?: string
   ) => {
      const newSectionId = `sec-${Date.now()}-${Math.random()}`;
      setTradeState(prev => {
         const newSection: OfferSectionState = {
            id: newSectionId,
            type: sectionType,
            items: [],
            isCollapsed: false
         };

         if (containerType === 'OFFER') {
            // Unique Type Check
            if (prev.offer.sections.some(s => s.type === sectionType)) return prev;
            if (prev.offer.sections.length >= 3) return prev;

            return {
               ...prev,
               offer: { sections: [...prev.offer.sections, newSection] }
            };
         } else if (containerType === 'REQUEST' && requestId) {
            return {
               ...prev,
               want: prev.want.map(req => {
                  if (req.id !== requestId || req.type !== 'BUNDLE') return req;
                  const currentSections = req.bundleSections || [];

                  // Check maxSections from Request Item state
                  if (req.maxSections && currentSections.length >= req.maxSections) return req;
                  if (currentSections.length >= 3) return req; // Fallback hard limit

                  if (currentSections.some(s => s.type === sectionType)) return req;

                  return { ...req, bundleSections: [...currentSections, newSection] };
               })
            };
         }
         return prev;
      });

      // Auto-select the new section if it's a card section
      if (sectionType === 'card') {
         setActiveSelection({ target: containerType, requestId, sectionId: newSectionId });
      }
   };

   const removeSection = (containerType: 'OFFER' | 'REQUEST', sectionId: string, requestId?: string) => {
      setTradeState(prev => {
         if (containerType === 'OFFER') {
            return { ...prev, offer: { sections: prev.offer.sections.filter(s => s.id !== sectionId) } };
         } else {
            return {
               ...prev,
               want: prev.want.map(req => {
                  if (req.id !== requestId) return req;
                  return { ...req, bundleSections: (req.bundleSections || []).filter(s => s.id !== sectionId) };
               })
            };
         }
      });
      // Deselect if removing active section
      if (activeSelection?.sectionId === sectionId) {
         setActiveSelection(null);
      }
   };

   const handleAddRequestItem = (type: 'card' | 'bot' | 'bundle') => {
      const newReqId = `req-${Date.now()}`;
      const newSectionId = `sec-${Date.now()}`;

      const newRequestItem: RequestItemState = {
         id: newReqId,
         type: 'BUNDLE',
         bundleSections: type === 'bundle' ? [] : [{
            id: newSectionId,
            type: type as 'card' | 'bot',
            items: [],
            isCollapsed: false
         }],
         maxSections: type === 'bundle' ? 3 : 1,
         isCollapsed: false
      };

      setTradeState(p => ({
         ...p,
         want: [...p.want, newRequestItem]
      }));

      // If adding 'card' type request item, auto-select it
      if (type === 'card') {
         setActiveSelection({ target: 'REQUEST', requestId: newReqId, sectionId: newSectionId });
      } else {
         // Maybe just focus on the request item? For now do nothing or select the bucket?
         // If bundle (empty), user needs to add section manually.
         // If bot, browser doesn't support bot selection yet (usually).
      }
   };

   // 3. Selection Logic (Smart Add)
   const { data: availableInventory } = useQuery({
      queryKey: ["my-inventory"],
      queryFn: getMyInventory,
      initialData: [],
   });

   // --- Derived State for Browser ---
   const stockCards = useMemo(() => {
      // Safely handle potentially null/undefined inventory
      const inventory = availableInventory || [];
      return inventory.filter(s => s.card).map(s => ({
         ...s.card!,
         stockQuantity: s.quantity
      }));
   }, [availableInventory]);

   const activeSectionItems = useMemo(() => {
      if (!activeSelection) return [];
      if (activeSelection.target === 'OFFER' && activeSelection.sectionId) {
         const section = tradeState.offer.sections.find(s => s.id === activeSelection.sectionId);
         return section ? section.items : [];
      }
      if (activeSelection.target === 'REQUEST' && activeSelection.requestId) {
         const req = tradeState.want.find(r => r.id === activeSelection.requestId);
         if (req?.type === 'BUNDLE' && activeSelection.sectionId) {
            const section = req.bundleSections?.find(s => s.id === activeSelection.sectionId);
            return section ? section.items : [];
         }
      }
      return [];
   }, [activeSelection, tradeState]);

   const activeSelectedCards = useMemo(() => activeSectionItems.map(i => i.product), [activeSectionItems]);

   const handleBrowserSelect = (selectedCards: CardType[]) => {
      if (!activeSelection) return;

      const target = activeSelection.target;
      const requestId = activeSelection.requestId;
      const sectionId = activeSelection.sectionId;

      setTradeState(prev => {
         // Helper to sync items
         const syncItems = (currentItems: OfferItem[]) => {
            const currentCardIds = new Set(currentItems.map(i => i.product.card_id));
            const selectedIds = new Set(selectedCards.map(c => c.card_id));

            // Keep existing items that are still selected
            let newItems = currentItems.filter(i => selectedIds.has(i.product.card_id));

            // Add new items
            selectedCards.forEach(card => {
               if (!currentCardIds.has(card.card_id)) {
                  newItems.push({
                     id: `item-${Date.now()}-${card.card_id}`,
                     product: card,
                     quantity: 1
                  });
               }
            });
            return newItems;
         };

         if (target === 'OFFER') {
            return {
               ...prev,
               offer: {
                  sections: prev.offer.sections.map(s => {
                     if (s.id !== sectionId) return s;
                     return { ...s, items: syncItems(s.items) };
                  })
               }
            };
         } else if (target === 'REQUEST' && requestId) {
            return {
               ...prev,
               want: prev.want.map(req => {
                  if (req.id !== requestId || req.type !== 'BUNDLE') return req;
                  return {
                     ...req,
                     bundleSections: (req.bundleSections || []).map(s => {
                        if (s.id !== sectionId) return s;
                        return { ...s, items: syncItems(s.items) };
                     })
                  };
               })
            };
         }
         return prev;
      });
   };

   // 4. Validation
   const mutation = useMutation({
      mutationFn: createTrade,
      onSuccess: () => {
         router.push("/th/market/trade");
         queryClient.invalidateQueries({ queryKey: ["trades"] });
      },
      onError: (error) => {
         console.error(error);
         alert("Failed to create trade");
      },
   });

   const isInfoValid = !!tradeState.info.name && !!tradeState.info.range && !!tradeState.info.range[0] && !!tradeState.info.range[1];
   const isOfferValid = tradeState.offer.sections.length > 0 && tradeState.offer.sections.every(s => s.items.length > 0);
   const isRequestValid = tradeState.want.length > 0 && tradeState.want.every(req => {
      if (req.type === 'TEXT') return (req.bullets?.filter(b => b.trim()).length || 0) > 0;
      if (req.type === 'BUNDLE') return (req.bundleSections?.length || 0) > 0 && req.bundleSections!.every(s => s.items.length > 0);
      return false;
   });

   const isValid = isInfoValid && isOfferValid && isRequestValid;
   const totalOffers = tradeState.offer.sections.length;
   const totalWantItems = tradeState.want.length;

   const handleSubmit = () => {
      if (!isValid || !tradeState.info.range || !tradeState.info.range[0] || !tradeState.info.range[1]) return;

      const payload: CreatePackageTradeInput = {
         tradeType: "MIXED",
         name: tradeState.info.name,
         forceCentralTrade: tradeState.info.forceCentral,
         started_at: tradeState.info.range[0].toISOString(),
         ended_at: tradeState.info.range[1].toISOString(),
         sections: tradeState.offer.sections.map(s => ({
            sectionType: (s.type === 'bot' ? "BOT" : s.items.length === 1 ? "SINGLE" : "DECK") as any,
            items: s.items.map(i => ({
               itemType: "PRODUCT",
               productId: i.product.card_id,
               quantity: 1
            }))
         })),
         want: tradeState.want.map(w => ({
            type: w.type === 'BUNDLE' ? "PRODUCT" : "TEXT",
            bullets: w.type === 'TEXT' ? w.bullets?.filter(b => b.trim()) : undefined,
            bundle: w.type === 'BUNDLE' ? {
               sections: (w.bundleSections || []).map(s => ({
                  sectionType: (s.type === 'bot' ? "BOT" : s.items.length === 1 ? "SINGLE" : "DECK") as any,
                  items: s.items.map(i => ({ productId: i.product.card_id }))
               })),
               addCash: w.bundleCash || 0
            } : undefined
         }))
      };

      mutation.mutate(payload);
   };

   // --- Renderers ---
   const renderSectionList = (
      sections: OfferSectionState[],
      containerType: 'OFFER' | 'REQUEST',
      requestId?: string,
      maxSections: number = 3
   ) => {
      const usedTypes = new Set(sections.map(s => s.type));

      return (
         <div className="space-y-4">
            {sections.length === 0 && (
               <div
                  className="text-center py-4 border-2 border-dashed border-gray-200 rounded text-gray-400 text-xs cursor-pointer hover:border-gray-400 hover:text-gray-500 transition-colors"
                  onClick={() => {
                     // Auto add 'card' section if clicked on empty
                     if (containerType === 'REQUEST' && requestId) {
                        addSectionToContainer(containerType, 'card', requestId);
                     }
                  }}
               >
                  เลือกประเภทเพื่อเริ่ม หรือ คลิกเพื่อเพิ่มการ์ด
               </div>
            )}

            {sections.map((section, idx) => {
               // Special rendering for Card Sections (Both OFFER and REQUEST)
               if (section.type === 'card') {
                  const isActive = activeSelection?.sectionId === section.id;

                  return (
                     <div key={section.id} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                           <span className="font-bold text-gray-600">การ์ด #{idx + 1}</span>
                           <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeSection(containerType, section.id, requestId)}
                           />
                        </div>

                        <div
                           className={`border-2 border-dashed rounded-lg p-4 text-center min-h-[100px] flex flex-col items-center justify-center cursor-pointer transition-colors ${isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                           onClick={() => setActiveSelection({ target: containerType, requestId, sectionId: section.id })}
                        >
                           {section.items.length > 0 ? (
                              <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3 w-full">
                                 {section.items.map(item => (
                                    <div key={item.id} className="relative group">
                                       <div className="relative aspect-[3/4] w-full">
                                          <div className="w-full h-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-200">
                                             {getImageUrl(item.product) && (
                                                <Image
                                                   src={getImageUrl(item.product)}
                                                   alt=""
                                                   fill
                                                   className="object-cover"
                                                />
                                             )}
                                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                          </div>
                                          <Button
                                             size="small"
                                             type="primary"
                                             danger
                                             shape="circle"
                                             icon={<CloseOutlined className="text-[10px]" />}
                                             className="absolute -top-1.5 -right-1.5 !w-5 !h-5 flex items-center justify-center p-0 shadow-md z-20 border-white border-2"
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                setTradeState(prev => {
                                                   const filterItems = (secs: OfferSectionState[]) => secs.map(s => s.id === section.id ? { ...s, items: s.items.filter(i => i.id !== item.id) } : s);

                                                   if (containerType === 'OFFER') {
                                                      return { ...prev, offer: { sections: filterItems(prev.offer.sections) } };
                                                   }

                                                   return {
                                                      ...prev,
                                                      want: prev.want.map(r => {
                                                         if (r.id !== requestId) return r;
                                                         return { ...r, bundleSections: filterItems(r.bundleSections || []) };
                                                      })
                                                   };
                                                });
                                             }}
                                          />
                                       </div>
                                       <div className="text-center mt-2 flex flex-col items-center gap-1">
                                          <div className="text-[10px] font-bold truncate max-w-full w-full">{item.product.name}</div>
                                          <div className="text-[9px] text-gray-500">
                                             x {item.quantity}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="text-xs text-gray-400">
                                 {isActive ? "เลือกการ์ดจากด้านขวา" : "คลิกเพื่อเลือกสินค้า"}
                              </div>
                           )}
                        </div>
                     </div>
                  );
               }

               // Default List Rendering (for BOT)
               return (
                  <div key={section.id} className="border rounded bg-white overflow-hidden">
                     <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-gray-600">
                              บอท #{idx + 1}
                           </span>
                           {section.items.length === 0 ? <WarningOutlined className="text-orange-500" /> : <CheckCircleOutlined className="text-green-500" />}
                        </div>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeSection(containerType, section.id, requestId)} />
                     </div>
                     <div className="p-2 space-y-2">
                        {section.items.map(item => (
                           <div key={item.id} className="flex gap-2 items-center border p-1 rounded">
                              <div className="w-8 h-10 bg-gray-200 relative flex-shrink-0">
                                 {getImageUrl(item.product) && <Image src={getImageUrl(item.product)} alt="" fill className="object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0 text-xs">
                                 <div className="truncate font-medium">{item.product.name}</div>
                                 <div className="text-[10px] text-gray-500">{item.product.rare}</div>
                              </div>
                              <Button
                                 type="text" danger size="small" icon={<CloseOutlined className="text-[10px]" />}
                                 onClick={() => {
                                    setTradeState(prev => {
                                       const filterItems = (secs: OfferSectionState[]) => secs.map(s => s.id === section.id ? { ...s, items: s.items.filter(i => i.id !== item.id) } : s);

                                       if (containerType === 'OFFER') return { ...prev, offer: { sections: filterItems(prev.offer.sections) } };
                                       return {
                                          ...prev,
                                          want: prev.want.map(r => {
                                             if (r.id !== requestId) return r;
                                             return { ...r, bundleSections: filterItems(r.bundleSections || []) };
                                          })
                                       };
                                    })
                                 }}
                              />
                           </div>
                        ))}

                        {/* Add Item Action */}
                        <Button
                           type="dashed" block size="small" icon={<PlusOutlined />}
                           onClick={() => setActiveSelection({ target: containerType, requestId, sectionId: section.id })}
                           className={`text-xs ${activeSelection?.sectionId === section.id ? 'border-black text-black' : ''}`}
                        >
                           เลือกการ์ด
                        </Button>
                     </div>
                  </div>
               );
            })}

            {sections.length < maxSections && (
               <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                     { key: 'card', label: 'การ์ด' },
                     { key: 'bot', label: 'BOT' }
                  ].map(t => (
                     <Button
                        key={t.key}
                        size="small"
                        disabled={usedTypes.has(t.key as any)}
                        onClick={() => addSectionToContainer(containerType, t.key as any, requestId)}
                     >
                        + {t.label}
                     </Button>
                  ))}
               </div>
            )}
         </div>
      );
   };

   return (
      <ConfigProvider theme={bottegaTheme}>
         <Layout className="min-h-screen bg-white">
            <PageHeader title="สร้างรายการแลกเปลี่ยน" onBack={() => router.back()} />

            <Layout className="h-[calc(100vh-64px)] bg-white">
               {/* SIDER */}
               <Sider width={siderWidth} theme="light" className="border-r border-gray-200 !bg-white relative z-20 p-0 flex flex-col h-full">
                  {/* Resize Handle */}
                  <div
                     className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 hover:bg-blue-400 opacity-0 hover:opacity-100"
                     style={{ transform: "translateX(50%)" }}
                     onMouseDown={startResizing}
                  />

                  <div className="flex flex-col h-full overflow-hidden">
                     <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                        <Title level={4} className="!mb-0">ตั้งสินค้าแลก-เปลี่ยน</Title>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">

                        {/* 1. INFO */}
                        <Card title="1. รายละเอียด" size="small">
                           <div className="space-y-4">
                              <FloatingLabelInput
                                 label="ชื่อรายการ"
                                 value={tradeState.info.name}
                                 onChange={e => updateInfo({ name: e.target.value })}
                              />
                              <div className="flex flex-col gap-1">
                                 <span className="text-xs text-gray-500">ระยะเวลา</span>
                                 <RangePicker
                                    className="w-full"
                                    value={tradeState.info.range}
                                    onChange={v => updateInfo({ range: v })}
                                 />
                              </div>
                           </div>
                        </Card>

                        {/* 2. OFFER */}
                        <Card
                           title={
                              <div
                                 className="flex items-center gap-2 cursor-pointer select-none"
                                 onClick={() => setCollapsedSections(prev => ({ ...prev, offer: !prev.offer }))}
                              >
                                 <span>2. สิ่งที่ฉันมี (เสนอให้)</span>
                                 {collapsedSections.offer ? <CaretRightOutlined /> : <DownOutlined />}
                              </div>
                           }
                           size="small"
                           className={`transition-all ${activeSelection?.target === 'OFFER' ? 'border-black ring-1 ring-black' : ''}`}
                        >
                           {!collapsedSections.offer && renderSectionList(tradeState.offer.sections, 'OFFER')}
                        </Card>

                        {/* 3. REQUEST */}
                        <Card
                           title={
                              <div
                                 className="flex items-center gap-2 cursor-pointer select-none"
                                 onClick={() => setCollapsedSections(prev => ({ ...prev, request: !prev.request }))}
                              >
                                 <span>3. สิ่งที่ฉันอยากได้ (ข้อเสนอที่รับ)</span>
                                 {collapsedSections.request ? <CaretRightOutlined /> : <DownOutlined />}
                              </div>
                           }
                           size="small"
                        >
                           {!collapsedSections.request && (
                              <div className="space-y-4">
                                 {tradeState.want.map((req, idx) => (
                                    <div key={req.id} className="border rounded p-3 bg-gray-50">
                                       <div className="flex justify-between mb-2">
                                          <span className="font-bold text-sm">รายการที่ขอ #{idx + 1}</span>
                                          <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => setTradeState(p => ({ ...p, want: p.want.filter(i => i.id !== req.id) }))} />
                                       </div>

                                       {req.type === 'TEXT' ? (
                                          <div className="space-y-2">
                                             {(req.bullets || []).map((b, bIdx) => (
                                                <Input key={bIdx} value={b} size="small" onChange={e => {
                                                   const newBullets = [...(req.bullets || [])];
                                                   newBullets[bIdx] = e.target.value;
                                                   setTradeState(p => ({ ...p, want: p.want.map(i => i.id === req.id ? { ...i, bullets: newBullets } : i) }));
                                                }} />
                                             ))}
                                             <Button type="dashed" block size="small" onClick={() => {
                                                setTradeState(p => ({ ...p, want: p.want.map(i => i.id === req.id ? { ...i, bullets: [...(i.bullets || []), ""] } : i) }));
                                             }}>+ เพิ่มข้อความ</Button>
                                          </div>
                                       ) : (
                                          <div onClick={() => setActiveSelection({ target: 'REQUEST', requestId: req.id })}>
                                             <div className={`p-2 border rounded mb-2 ${activeSelection?.target === 'REQUEST' && activeSelection.requestId === req.id ? 'bg-blue-50 border-blue-500' : 'bg-white'}`}>
                                                <span className="text-xs text-gray-500">กล่องชุดสินค้า (คลิกเพื่อเลือก)</span>
                                             </div>
                                             {renderSectionList(req.bundleSections || [], 'REQUEST', req.id, req.maxSections || 3)}

                                             <div className="mt-2 pt-2 border-t">
                                                <div className="flex justify-between items-center">
                                                   <span className="text-xs">เพิ่มเงินสด</span>
                                                   <InputNumber
                                                      size="small"
                                                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                      parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                                      value={req.bundleCash}
                                                      onChange={v => setTradeState(p => ({ ...p, want: p.want.map(i => i.id === req.id ? { ...i, bundleCash: v || 0 } : i) }))}
                                                   />
                                                </div>
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 ))}

                                 {tradeState.want.length < 3 && (
                                    <div className="flex flex-col gap-2">
                                       <div className="grid grid-cols-3 gap-2">
                                          <Button
                                             size="small"
                                             type="dashed"
                                             onClick={() => handleAddRequestItem('card')}
                                          >
                                             + การ์ด
                                          </Button>
                                          <Button
                                             size="small"
                                             type="dashed"
                                             onClick={() => handleAddRequestItem('bot')}
                                          >
                                             + BOT
                                          </Button>
                                          <Button
                                             size="small"
                                             type="dashed"
                                             onClick={() => handleAddRequestItem('bundle')}
                                          >
                                             + ชุดสินค้า
                                          </Button>
                                       </div>
                                       <Button type="dashed" block size="small" onClick={() => setTradeState(p => ({ ...p, want: [...p.want, { id: `req-${Date.now()}`, type: 'TEXT', bullets: [""], isCollapsed: false }] }))}>+ ข้อความระบุ</Button>
                                    </div>
                                 )}
                              </div>

                           )}
                        </Card>

                     </div>


                     {/* FOOTER (Conclusion / Summary) */}
                     <div className="border-t border-gray-200 bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] space-y-4">

                        {/* Summary */}
                        <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                           <div className="flex justify-between">
                              <span className="text-gray-500">จำนวนส่วนที่เสนอ:</span>
                              <span className="font-medium">{totalOffers}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-gray-500">จำนวนข้อเสนอที่รับ:</span>
                              <span className="font-medium">{totalWantItems}</span>
                           </div>
                        </div>

                        <div className="flex items-center justify-between">
                           <span className="text-xs font-bold uppercase">บังคับใช้ระบบกลาง</span>
                           <Switch
                              size="small"
                              checked={tradeState.info.forceCentral}
                              onChange={v => updateInfo({ forceCentral: v })}
                           />
                        </div>

                        <Button
                           type="primary" block size="large" className="bg-black"
                           disabled={!isValid || mutation.isPending}
                           onClick={handleSubmit}
                           loading={mutation.isPending}
                        >
                           สร้างรายการ
                        </Button>
                     </div>
                  </div>
               </Sider>

               {/* BROWSER */}
               <Content className="bg-white flex flex-col h-full overflow-hidden">
                  <div className="p-2 border-b bg-gray-50 text-xs flex items-center gap-2">
                     <InfoCircleOutlined />
                     {activeSelection ? `กำลังเลือกสำหรับ: ${activeSelection.target === 'OFFER' ? 'สิ่งที่ฉันมี' : 'สิ่งที่ฉันอยากได้'}` : 'เลือกกล่องเพื่อดูสินค้า'}
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                     {!activeSelection && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center text-gray-400">เลือกส่วนทางซ้าย</div>}
                     <CardBrowser
                        selectable={!!activeSelection}
                        multiple={true}
                        onSelect={handleBrowserSelect}
                        selectedCards={activeSelectedCards}
                        availableCards={activeSelection?.target === 'REQUEST' ? undefined : stockCards}
                        headerActions={activeSelection?.target === 'OFFER' ? (
                           <Link href="/stock" target="_blank">
                              <Button type="primary" size="small" icon={<PlusOutlined />}>
                                 เพิ่มการ์ดที่มี
                              </Button>
                           </Link>
                        ) : undefined}
                        className="h-full"
                        renderCustomActions={(card, isSelected) => isSelected && (
                           <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 flex flex-col items-center gap-2">
                              <div className="w-full">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="text-[11px] font-medium text-gray-500">
                                       จำนวน
                                    </span>
                                    <Button
                                       type="text" danger size="small"
                                       className="!p-0 !h-auto text-[10px]"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          handleBrowserSelect(activeSelectedCards.filter(c => c.card_id !== card.card_id));
                                       }}
                                    >
                                       ลบออก
                                    </Button>
                                 </div>

                                 <InputNumber
                                    min={1} size="small" className="w-full"
                                    max={activeSelection?.target === 'OFFER' ? (card as any).stockQuantity : undefined}
                                    value={activeSectionItems.find(i => i.product.card_id === card.card_id)?.quantity || 1}
                                    onChange={(val) => {
                                       if (!val || !activeSelection) return;
                                       setTradeState(prev => {
                                          const updateQty = (items: OfferItem[]) => items.map(i => i.product.card_id === card.card_id ? { ...i, quantity: val } : i);

                                          if (activeSelection.target === 'OFFER' && activeSelection.sectionId) {
                                             return {
                                                ...prev,
                                                offer: {
                                                   sections: prev.offer.sections.map(s => {
                                                      if (s.id !== activeSelection.sectionId) return s;
                                                      return { ...s, items: updateQty(s.items) };
                                                   })
                                                }
                                             };
                                          } else if (activeSelection.target === 'REQUEST' && activeSelection.requestId && activeSelection.sectionId) {
                                             return {
                                                ...prev,
                                                want: prev.want.map(req => {
                                                   if (req.id !== activeSelection.requestId) return req;
                                                   return {
                                                      ...req,
                                                      bundleSections: (req.bundleSections || []).map(s => {
                                                         if (s.id !== activeSelection.sectionId) return s;
                                                         return { ...s, items: updateQty(s.items) };
                                                      })
                                                   };
                                                })
                                             };
                                          }
                                          return prev;
                                       });
                                    }}
                                 />
                              </div>
                           </div>
                        )}
                     />
                  </div>
               </Content>
            </Layout>
         </Layout>
      </ConfigProvider >
   );
}
