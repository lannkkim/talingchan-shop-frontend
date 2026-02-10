import React, { useState } from "react";
import { Card, Button, Typography, Form, Image, InputNumber, Divider, Select, ConfigProvider } from "antd";
import { DownOutlined, RightOutlined, CloseOutlined } from "@ant-design/icons";
import { Card as CardType } from "@/types/card";
import { getCardImageUrl } from "@/utils/image";
import { FloatingLabelInput } from "@/components/shared/FloatingLabelInput";

const { Title, Text } = Typography;

interface TradeItemCardProps {
    index: number;
    title: string;
    isActive: boolean;
    selectedCards: CardType[];
    onClick: () => void;
    onRemove?: () => void;
    onRemoveCard: (cardId: string) => void;
    fieldPrefix?: (string | number)[]; // e.g., ["want_items", 0] or []

    // Field Names for Cash/Note to allow flexibility
    cashFieldName: string;
    noteFieldName: string;

    // Quantity field handling
    getQuantityName: (cardId: string) => (string | number)[] | string;
}

export const TradeItemCard: React.FC<TradeItemCardProps> = ({
    index,
    title,
    isActive,
    selectedCards,
    onClick,
    onRemove,
    onRemoveCard,
    fieldPrefix = [],
    cashFieldName,
    noteFieldName,
    getQuantityName,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <Card
            className={`border transition-all duration-200 mb-4 ${isActive ? 'border-black shadow-md ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
            styles={{ body: { padding: '16px' } }}
            onClick={onClick}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer w-full" onClick={toggleExpand}>
                    {isExpanded ? <DownOutlined className="text-[10px]" /> : <RightOutlined className="text-[10px]" />}
                    <Title level={5} className="!mb-0 text-sm">{title}</Title>

                    {!isExpanded && (
                        <div className="ml-2 flex items-center gap-2">
                            <Text type="secondary" className="text-[10px] italic truncate max-w-[150px]">
                                {selectedCards.length > 0 ? `การ์ด ${selectedCards.length} ใบ` : "ยังไม่ได้เลือกสินค้า"}
                            </Text>
                        </div>
                    )}
                </div>

                {onRemove && (
                    <Button
                        type="text"
                        danger
                        icon={<CloseOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                    />
                )}
            </div>

            {isExpanded && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Selected Cards Display */}
                    <Form.Item label="รายการสินค้า" required className="!mb-4">
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center min-h-[100px] flex flex-col items-center justify-center cursor-pointer transition-colors ${isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            {selectedCards.length > 0 ? (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 w-full">
                                    {selectedCards.map(card => (
                                        <div key={card.card_id} className="relative group">
                                            <div className="relative aspect-[3/4] w-full">
                                                <div className="w-full h-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                    <Image
                                                        src={getCardImageUrl(card.image_name)}
                                                        className="w-full h-full object-cover"
                                                        preview={false}
                                                    />
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
                                                        onRemoveCard(card.card_id);
                                                    }}
                                                />
                                            </div>
                                            <div className="text-center mt-2 flex flex-col items-center gap-1">
                                                <div className="text-xs font-bold truncate max-w-full">{card.name}</div>
                                                <div className="text-[10px] text-gray-500">
                                                    <Form.Item shouldUpdate noStyle>
                                                        {({ getFieldValue }) => {
                                                            // Resolve quantity path dynamically
                                                            const qtyPath = getQuantityName(card.card_id);
                                                            const qty = getFieldValue(qtyPath) || 1;
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

                    <Divider className="!my-4" />

                    {/* Money & Note */}
                    <div className="grid grid-cols-1 gap-4">
                        <Form.Item
                            name={fieldPrefix.length > 0 ? [...fieldPrefix, cashFieldName] : cashFieldName}
                        >
                            <FloatingLabelInput
                                label="จำนวนเงิน (Cash)"
                                type="number"
                            />
                        </Form.Item>

                        <Form.Item
                            name={fieldPrefix.length > 0 ? [...fieldPrefix, noteFieldName] : noteFieldName}
                        >
                            <FloatingLabelInput
                                label="ข้อความเพิ่มเติม (Note)"
                            />
                        </Form.Item>
                    </div>
                </div>
            )}
        </Card>
    );
};
