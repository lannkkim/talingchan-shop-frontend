"use client";

import { Product } from "@/types/product";
import { Typography, Row, Col, Card } from "antd";
import TradingProductCard from "./TradingProductCard";
import Image from "next/image";

const { Title, Text } = Typography;

interface SymbolGroupSectionProps {
  symbol: string;
  products: Product[];
}

export default function SymbolGroupSection({
  symbol,
  products,
}: SymbolGroupSectionProps) {
  // Mocking a symbol image mapping or logic.
  // If the symbol is a URL or filename, we use it directly.
  // For now, we'll use a placeholder or conditional logic.
  // In the real app, this might come from a Symbol table or static mapping.

  // For the mock "Wagon" icon, let's assume 'symbol' holds a name like "The Wagon".
  // You might want to pass a specific icon URL if available.

  const getSymbolIcon = (sym: string) => {
    // Logic to get icon. Returning a placeholder for now.
    return "/images/symbol-placeholder.png";
  };

  // If the symbol name is actually a URL or file name, we can improve this.
  // For now, let's assume we display the symbol text prominently.

  return (
    <Card
      className="w-full mb-8 rounded-xl shadow-sm border-gray-200"
      styles={{ body: { padding: "24px" } }}
    >
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="w-16 h-16 relative bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-center">
          {/* Placeholder for Symbol Icon - You might want to replace src with actual logic */}
          <div className="text-4xl">👑</div>
          {/* 
               <Image 
                   src={getSymbolIcon(symbol)} 
                   alt={symbol} 
                   fill 
                   className="object-contain p-1"
               />
               */}
        </div>
        <div>
          <Title level={4} className="mb-0 !font-bold text-gray-800">
            {symbol}
          </Title>
        </div>
        <div className="ml-auto">
          <Text type="secondary" className="text-xs">
            {products.length} สินค้า
          </Text>
        </div>
      </div>

      {/* Grid Section */}
      <Row gutter={[24, 24]}>
        {products.map((product) => (
          <Col key={product.product_id} xs={24} md={12}>
            <TradingProductCard product={product} />
          </Col>
        ))}
      </Row>
    </Card>
  );
}
