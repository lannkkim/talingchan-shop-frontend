"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCardById } from "@/services/card";
import { getProducts } from "@/services/product";
import { Product } from "@/types/product";
import { Card as AntCard, Spin, Typography, Row, Col, Divider, Layout, Tag, Statistic, Table, Button, Space, Empty } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, ShoppingCartOutlined, ShopOutlined } from "@ant-design/icons";
import PageHeader from "@/components/shared/PageHeader";
import Image from "next/image";
import Link from "next/link";
import { getCardImageUrl } from "@/utils/image";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function CardMarketStatsPage() {
  const params = useParams();
  const encodedId = params.id as string;
  let cardId = 0;
  
  try {
    if (encodedId) {
      cardId = parseInt(atob(decodeURIComponent(encodedId)));
    }
  } catch (e) {
    console.error("Failed to decode card ID", e);
  }


  // Fetch Card Details
  const { data: card, isLoading: loadingCard } = useQuery({
    queryKey: ["card", cardId],
    queryFn: () => getCardById(cardId),
    enabled: !!cardId,
  });

  // Fetch Active Listings for this Card
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "market", "card", cardId],
    queryFn: () => getProducts({
      card_id: cardId,
      status: "active",
      include_shop: true,
    }),
    enabled: !!cardId,
  });

  // Calculate Stats
  const listings = products.filter(p => p.product_type?.code !== 'deck');
  
  let totalPriceSum = 0;
  let totalSupply = 0;
  const prices: number[] = [];

  listings.forEach(p => {
    // Deck check removed as listings is already filtered

    const activePrice = p.price_period?.find(pp => pp.status === "active") || p.price_period?.[0];
    const price = activePrice?.price ? Number(activePrice.price) : 0;
    
    // Find the quantity of THIS card in the product
    // p.product_stock_card contains all cards in the product (deck or single)
    // We need to match the cardId.
    // Note: psc.card_id might be directly available or via stock_card
    // The backend filter ensured this product contains the card.
    const psc = p.product_stock_card?.find(item => 
       item.card_id === cardId || 
       item.stock_card?.card_id === cardId ||
       item.card?.card_id === cardId
    );
    
    if (psc && price > 0) {
        const qty = psc.quantity || 1; // Supply of this card in this product listing
        totalPriceSum += price;
        totalSupply += qty;
        prices.push(price);
    }
  });

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const avgPrice = totalSupply > 0 ? totalPriceSum / totalSupply : 0;
  const totalQty = totalSupply;


  const columns = [
    {
      title: "Product",
      key: "name",
      render: (_: unknown, record: Product) => (
         <Space orientation="vertical" size={0}>
            <Text strong>{record.name}</Text>
            {record.product_type?.code !== 'single' && <Tag color="purple" className="mt-1 text-[10px]">{record.product_type?.name}</Tag>}
         </Space>
      ),
    },
    {
      title: "Shop",
      key: "shop",
      render: (_: unknown, record: Product) => (
        <Space>
           {record.is_admin_shop ? <Tag color="blue">Official</Tag> : <ShopOutlined />}
           <Text>{record.users?.shop?.name || record.users?.username || "Seller"}</Text>
        </Space>
      ),
    },
    {
      title: "Quantity",
      key: "quantity",
      render: (_: unknown, record: Product) => (
         <Text>{record.total_quantity?.toLocaleString() || "-"}</Text>
      ),
      sorter: (a: Product, b: Product) => (a.total_quantity || 0) - (b.total_quantity || 0),
    },
    {
      title: "Price",
      key: "price",
      render: (_: unknown, record: Product) => {
         const activePrice = record.price_period?.find(pp => pp.status === "active") || record.price_period?.[0];
         return <Text strong className="text-blue-600">฿{activePrice?.price ? Number(activePrice.price).toLocaleString() : "-"}</Text>;
      },
      sorter: (a: Product, b: Product) => {
         const pa = Number(a.price_period?.find(pp => pp.status === "active")?.price || a.price_period?.[0]?.price || 0);
         const pb = Number(b.price_period?.find(pp => pp.status === "active")?.price || b.price_period?.[0]?.price || 0);
         return pa - pb;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Product) => (
         <Button size="small" type="primary" disabled>View</Button>
      ),
    },
  ];

  if (loadingCard) {
    return (
      <Layout className="min-h-screen bg-white">
        <PageHeader title="Loading..." />
        <div className="flex justify-center items-center h-[500px]">
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (!card) {
      return (
        <Layout className="min-h-screen bg-white">
          <PageHeader title="Not Found" />
          <div className="text-center py-20">Card not found</div>
        </Layout>
      );
  }

  return (
    <Layout className="min-h-screen bg-white">
      <PageHeader title={`Market Data: ${card.name}`} backUrl="/market" />
      <Content className="container mx-auto p-4 md:p-8">
        <Row gutter={[24, 24]}>
          {/* Left: Card Info */}
          <Col xs={24} md={8} lg={6}>
             <AntCard className="text-center sticky top-0">
                <div className="relative w-full aspect-[3/4] mb-4 bg-gray-50 rounded-lg overflow-hidden">
                   <Image 
                      src={getCardImageUrl(card.image_name)}
                      alt={card.name}
                      fill
                      className="object-contain"
                   />
                </div>
                <Title level={4} className="mb-1">{card.name}</Title>
                <Tag color="gold" className="text-lg px-3 py-1">{card.rare}</Tag>
                <Divider />
                <div className="text-left space-y-2">
                   <div className="flex justify-between"><Text type="secondary">Type</Text> <Text>{card.type}</Text></div>
                   <div className="flex justify-between"><Text type="secondary">Print ID</Text> <Text>{card.print}</Text></div>
                   <div className="flex justify-between"><Text type="secondary">Color</Text> <Text>{card.color || "-"}</Text></div>
                </div>
             </AntCard>
          </Col>

          {/* Right: Stats & Listings */}
          <Col xs={24} md={16} lg={18}>
             <Title level={4}>Market Statistics</Title>
             <Row gutter={[16, 16]} className="mb-8">
                <Col span={8}>
                   <AntCard>
                      <Statistic 
                         title="Lowest Price" 
                         value={minPrice} 
                         precision={2} 
                         prefix="฿" 
                         styles={{ content: { color: '#3f8600' } }}
                         suffix={minPrice > 0 ? <ArrowDownOutlined /> : null}
                      />
                   </AntCard>
                </Col>
                <Col span={8}>
                   <AntCard>
                      <Statistic 
                         title="Average Price" 
                         value={avgPrice} 
                         precision={2} 
                         prefix="฿" 
                      />
                   </AntCard>
                </Col>
                <Col span={8}>
                   <AntCard>
                      <Statistic 
                         title="Total Supply" 
                         value={totalQty} 
                         suffix="cards"
                         prefix={<ShoppingCartOutlined />}
                      />
                   </AntCard>
                </Col>
             </Row>

             <Title level={4}>สินค้าตั้งขายทั้งหมด ({listings.length})</Title>
             <Table 
                dataSource={listings} 
                columns={columns} 
                rowKey="product_id"
                pagination={{ pageSize: 10 }}
             />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
