"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCardById, getCardSalesHistory, SalesHistoryPoint } from "@/services/card";
import { getProducts } from "@/services/product";
import { Product } from "@/types/product";
import {
  Card as AntCard, Spin, Typography, Row, Col, Divider,
  Layout, Tag, Statistic, Table, Button, Space, Empty, Tabs
} from "antd";
import {
  ArrowDownOutlined, ShopOutlined, BarChartOutlined,
  ShoppingOutlined, TagOutlined, HistoryOutlined
} from "@ant-design/icons";
import PageHeader from "@/components/shared/PageHeader";
import Image from "next/image";
import { useState, useMemo } from "react";
import { getCardImageUrl } from "@/utils/image";
import { colorToThai } from "@/constants/filters";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import Link from "next/link";

const { Title, Text } = Typography;
const { Content } = Layout;

const COLOR_DOT: Record<string, string> = {
  แดง: "#ef4444",
  ฟ้า: "#3b82f6",
  เขียว: "#22c55e",
  ม่วง: "#a855f7",
  ขาว: "#d1d5db",
  ดำ: "#1f2937",
};

export default function CardMarketStatsPage() {
  const params = useParams();
  const cardId = params.id as string;
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<1 | 7 | 30>(30);

  const { data: card, isLoading: loadingCard } = useQuery({
    queryKey: ["card", cardId],
    queryFn: () => getCardById(cardId),
    enabled: !!cardId,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "market", "card", cardId],
    queryFn: () => getProducts({ card_id: cardId, include_shop: true, status: "active" }),
    enabled: !!cardId,
    select: (data) => data ?? [],
  });

  const { data: salesHistory = [], isLoading: loadingSales } = useQuery({
    queryKey: ["card", cardId, "sales-history"],
    queryFn: () => getCardSalesHistory(cardId, 60),
    enabled: !!cardId,
    select: (data) => data ?? [],
  });

  // Separate sell vs buy listings (exclude deck bundles for sell)
  const sellListings = useMemo(
    () => products.filter(
      (p) => p.transaction_type?.code === "sell" && p.product_type?.code !== "deck"
    ),
    [products]
  );

  const buyListings = useMemo(
    () => products.filter((p) => p.transaction_type?.code === "buy"),
    [products]
  );

  // Compute stats from single-type sell listings only (price per card is meaningful)
  const singleSellListings = useMemo(
    () => sellListings.filter((p) => p.product_type?.code === "single"),
    [sellListings]
  );

  const stats = useMemo(() => {
    if (singleSellListings.length === 0) return { min: 0, avg: 0, max: 0, count: 0 };
    const prices = singleSellListings.map((p) => Number(p.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { min, avg, max, count: singleSellListings.length };
  }, [singleSellListings]);

  // Lowest sold price across all sales history
  const lowestSoldPrice = useMemo(() => {
    const completed = salesHistory.filter(pt => pt.order_status === "CP");
    if (completed.length === 0) return 0;
    return Math.min(...completed.map(pt => pt.price));
  }, [salesHistory]);

  // Sales history chart data — filtered by range, oldest first
  const chartData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - chartRange);
    const filtered = salesHistory.filter(pt => new Date(pt.date) >= cutoff);
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted.map((pt) => ({
      price: pt.price,
      date: new Date(pt.date).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" }),
      product_name: pt.product_name,
      order_status: pt.order_status,
    }));
  }, [salesHistory, chartRange]);

  // Sales history avg for chart reference line (within range)
  const salesAvgLine = useMemo(() => {
    if (chartData.length === 0) return undefined;
    const total = chartData.reduce((sum, pt) => sum + pt.price, 0);
    return total / chartData.length;
  }, [chartData]);

  const colorThai = colorToThai(card?.color);
  const colorDot = COLOR_DOT[colorThai];

  // Table columns — sell listings
  const sellColumns = [
    {
      title: "สินค้า",
      key: "name",
      render: (_: unknown, r: Product) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{r.name}</Text>
          {r.product_type?.code !== "single" && (
            <Tag color="purple" className="mt-1 text-[10px]">{r.product_type?.name}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "ร้านค้า",
      key: "shop",
      render: (_: unknown, r: Product) => (
        <Space>
          {r.is_admin_shop
            ? <Tag color="blue">Official</Tag>
            : <ShopOutlined />}
          {r.users?.shop?.shop_id ? (
            <Link href={`/shops/${r.users.shop.shop_id}`}>
              <Text className="underline-offset-2 hover:underline cursor-pointer">
                {r.users.shop.shop_profile?.shop_name || r.users?.username || "Seller"}
              </Text>
            </Link>
          ) : (
            <Text>{r.users?.username || "Seller"}</Text>
          )}
        </Space>
      ),
    },
    {
      title: "จำนวนคงเหลือ",
      key: "qty",
      render: (_: unknown, r: Product) => <Text>{r.quantity ?? "-"}</Text>,
      sorter: (a: Product, b: Product) => (a.quantity || 0) - (b.quantity || 0),
    },
    {
      title: "ราคา/ใบ",
      key: "price",
      render: (_: unknown, r: Product) => (
        <Text strong className="text-blue-600">
          ฿{r.price ? Number(r.price).toLocaleString() : "-"}
        </Text>
      ),
      sorter: (a: Product, b: Product) => (Number(a.price) || 0) - (Number(b.price) || 0),
      defaultSortOrder: "ascend" as const,
    },
  ];

  // Table columns — buy listings
  const buyColumns = [
    {
      title: "ประกาศ",
      key: "name",
      render: (_: unknown, r: Product) => <Text strong>{r.name}</Text>,
    },
    {
      title: "ผู้ต้องการซื้อ",
      key: "buyer",
      render: (_: unknown, r: Product) => (
        <Text>{r.users?.username || r.users?.shop?.shop_profile?.shop_name || "ผู้ใช้"}</Text>
      ),
    },
    {
      title: "ราคาที่ยินดีจ่าย",
      key: "price",
      render: (_: unknown, r: Product) => (
        <Text strong className="text-green-600">
          ฿{r.price ? Number(r.price).toLocaleString() : "-"}
        </Text>
      ),
      sorter: (a: Product, b: Product) => (Number(a.price) || 0) - (Number(b.price) || 0),
      defaultSortOrder: "descend" as const,
    },
  ];

  if (loadingCard) {
    return (
      <Layout className="min-h-screen">
        <PageHeader title="กำลังโหลด..." />
        <div className="flex justify-center items-center h-[500px]">
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (!card) {
    return (
      <Layout className="min-h-screen">
        <PageHeader title="ไม่พบการ์ด" />
        <div className="text-center py-20">Card not found</div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <PageHeader title={`ข้อมูลตลาด: ${card.name}`} backUrl="/market" />
      <Content className="container mx-auto p-4 md:p-8">
        <Row gutter={[24, 24]}>
          {/* Left: Card Info */}
          <Col xs={24} md={8} lg={6}>
            <AntCard className="text-center sticky top-4">
              <div className="relative w-full aspect-[3/4] mb-4 bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={imgSrc ?? getCardImageUrl(card.image_name, "original")}
                  alt={card.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 300px"
                  unoptimized
                  onError={() => setImgSrc("/images/card-placeholder.png")}
                />
              </div>
              <Title level={4} className="!mb-1">{card.name}</Title>
              <Tag color="gold" className="text-base px-3 py-0.5">{card.rare}</Tag>
              <Divider />
              <div className="text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <Text type="secondary">Type</Text>
                  <Text>{card.type}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Print ID</Text>
                  <Text>{card.print}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text type="secondary">Color</Text>
                  <div className="flex items-center gap-1.5">
                    {colorDot && (
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: colorDot }}
                      />
                    )}
                    <Text>{colorThai}</Text>
                  </div>
                </div>
                {card.cost != null && (
                  <div className="flex justify-between">
                    <Text type="secondary">Cost</Text>
                    <Text>{card.cost}</Text>
                  </div>
                )}
                {card.power != null && (
                  <div className="flex justify-between">
                    <Text type="secondary">Power</Text>
                    <Text>{card.power}</Text>
                  </div>
                )}
                {card.symbol && (
                  <div className="flex justify-between">
                    <Text type="secondary">Symbol</Text>
                    <Text>{card.symbol}</Text>
                  </div>
                )}
              </div>
            </AntCard>
          </Col>

          {/* Right: Stats + Chart + Listings */}
          <Col xs={24} md={16} lg={18}>
            {/* Market Stats — from single-type listings only */}
            <Title level={4}>Market Statistics
              <Text type="secondary" className="text-sm font-normal ml-2">(ราคาต่อใบ — แยกใบเท่านั้น)</Text>
            </Title>
            <Row gutter={[16, 16]} className="mb-8">
              <Col xs={12} sm={8}>
                <AntCard loading={loadingProducts}>
                  <Statistic
                    title="ราคาต่ำสุด (ตั้งขาย)"
                    value={stats.min || "-"}
                    precision={stats.min ? 0 : undefined}
                    prefix={stats.min ? "฿" : ""}
                    styles={{ content: { color: "#16a34a" } }}
                    suffix={stats.min ? <ArrowDownOutlined /> : null}
                  />
                </AntCard>
              </Col>
              <Col xs={12} sm={8}>
                <AntCard loading={loadingSales}>
                  <Statistic
                    title="ราคาต่ำสุด (ขายออก)"
                    value={lowestSoldPrice || "-"}
                    precision={lowestSoldPrice ? 0 : undefined}
                    prefix={lowestSoldPrice ? "฿" : ""}
                    styles={{ content: { color: "#2563eb" } }}
                  />
                </AntCard>
              </Col>
              <Col xs={12} sm={8}>
                <AntCard loading={loadingProducts}>
                  <Statistic
                    title="ราคาเฉลี่ย (ตั้งขาย)"
                    value={stats.avg ? Math.round(stats.avg) : "-"}
                    prefix={stats.avg ? "฿" : ""}
                  />
                </AntCard>
              </Col>
              <Col xs={12} sm={8}>
                <AntCard loading={loadingProducts}>
                  <Statistic
                    title="ราคาสูงสุด"
                    value={stats.max || "-"}
                    precision={stats.max ? 0 : undefined}
                    prefix={stats.max ? "฿" : ""}
                    styles={{ content: { color: "#dc2626" } }}
                  />
                </AntCard>
              </Col>
              <Col xs={12} sm={8}>
                <AntCard loading={loadingProducts}>
                  <Statistic
                    title="Listing ที่ขายอยู่"
                    value={stats.count}
                    prefix={<BarChartOutlined />}
                    suffix="รายการ"
                  />
                </AntCard>
              </Col>
            </Row>

            {/* Sales Price History Chart */}
            <AntCard
              title={`ราคาที่ขายออกจริง (${chartData.length} รายการ)`}
              className="mb-8"
              loading={loadingSales}
              extra={
                <Space size={4}>
                  {([1, 7, 30] as const).map((d) => (
                    <Button
                      key={d}
                      size="small"
                      type={chartRange === d ? "primary" : "default"}
                      onClick={() => setChartRange(d)}
                    >
                      {d === 1 ? "1 วัน" : d === 7 ? "7 วัน" : "30 วัน"}
                    </Button>
                  ))}
                </Space>
              }
            >
              {chartData.length === 0 ? (
                <Empty description="ยังไม่มีประวัติการขาย" className="py-6" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
                    />
                    <YAxis
                      tickFormatter={(v) => `฿${Number(v).toLocaleString()}`}
                      tick={{ fontSize: 11 }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(value: unknown) => [`฿${Number(value).toLocaleString()}`, "ราคาขาย"]}
                      labelFormatter={(label) => `วันที่: ${label}`}
                    />
                    {salesAvgLine && (
                      <ReferenceLine
                        y={salesAvgLine}
                        stroke="#f97316"
                        strokeDasharray="4 4"
                        label={{ value: `เฉลี่ย ฿${Math.round(salesAvgLine).toLocaleString()}`, position: "insideTopRight", fontSize: 11, fill: "#f97316" }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#3b82f6" }}
                      activeDot={{ r: 5 }}
                      name="ราคาขาย"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </AntCard>

            {/* Listings Tabs */}
            <Tabs
              defaultActiveKey="sell"
              items={[
                {
                  key: "sell",
                  label: (
                    <span>
                      <ShoppingOutlined className="mr-1" />
                      ตั้งขายทั้งหมด ({loadingProducts ? "..." : sellListings.length})
                    </span>
                  ),
                  children: sellListings.length === 0 && !loadingProducts ? (
                    <Empty description="ยังไม่มีสินค้าตั้งขาย" className="py-8" />
                  ) : (
                    <Table
                      dataSource={sellListings}
                      columns={sellColumns}
                      rowKey="product_id"
                      loading={loadingProducts}
                      pagination={{ pageSize: 10 }}
                      size="middle"
                    />
                  ),
                },
                {
                  key: "buy",
                  label: (
                    <span>
                      <TagOutlined className="mr-1" />
                      ประกาศรับซื้อ ({loadingProducts ? "..." : buyListings.length})
                    </span>
                  ),
                  children: buyListings.length === 0 && !loadingProducts ? (
                    <Empty description="ยังไม่มีประกาศรับซื้อ" className="py-8" />
                  ) : (
                    <Table
                      dataSource={buyListings}
                      columns={buyColumns}
                      rowKey="product_id"
                      loading={loadingProducts}
                      pagination={{ pageSize: 10 }}
                      size="middle"
                    />
                  ),
                },
                {
                  key: "sales",
                  label: (
                    <span>
                      <HistoryOutlined className="mr-1" />
                      ประวัติการขาย ({loadingSales ? "..." : salesHistory.length})
                    </span>
                  ),
                  children: salesHistory.length === 0 && !loadingSales ? (
                    <Empty description="ยังไม่มีประวัติการขาย" className="py-8" />
                  ) : (
                    <Table
                      dataSource={salesHistory}
                      rowKey={(r: SalesHistoryPoint) => `${r.date}-${r.product_name}-${r.price}`}
                      loading={loadingSales}
                      pagination={{ pageSize: 20 }}
                      size="middle"
                      columns={[
                        {
                          title: "วันที่ขาย",
                          dataIndex: "date",
                          render: (d: string) => new Date(d).toLocaleDateString("th-TH", {
                            day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit"
                          }),
                          sorter: (a: SalesHistoryPoint, b: SalesHistoryPoint) =>
                            new Date(a.date).getTime() - new Date(b.date).getTime(),
                          defaultSortOrder: "descend" as const,
                        },
                        {
                          title: "สินค้า",
                          dataIndex: "product_name",
                        },
                        {
                          title: "ราคาขาย",
                          dataIndex: "price",
                          render: (p: number) => (
                            <Text strong className="text-blue-600">฿{p.toLocaleString()}</Text>
                          ),
                          sorter: (a: SalesHistoryPoint, b: SalesHistoryPoint) => a.price - b.price,
                        },
                        {
                          title: "จำนวน",
                          dataIndex: "quantity",
                          render: (q: number) => <Text>{q}</Text>,
                        },
                        {
                          title: "สถานะ",
                          dataIndex: "order_status",
                          render: (s: string) => (
                            <Tag color={s === "CP" ? "green" : "blue"}>
                              {s === "CP" ? "สำเร็จ" : "กำลังส่ง"}
                            </Tag>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
