"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import { addToCart } from "@/services/cart";
import { Product } from "@/types/product";
import { Card, Spin, Typography, Row, Col, Divider, Layout, Tag, Modal, Button, Space, InputNumber, App, Alert } from "antd";
import { LineChartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import FavoriteButton from "@/components/market/FavoriteButton";
import BuyRequestModal from "@/components/market/BuyRequestModal";
import { Link as NavLink } from "@/navigation";
import Image from "next/image";
import PageHeader from "@/components/shared/PageHeader";
import { Suspense, useState } from "react";
import Link from "next/link";
import { getCardImageUrl } from "@/utils/image";
import { useAuth } from "@/contexts/AuthContext";

const { Title, Text } = Typography;
const { Content } = Layout;

function AllMarketProductsContent() {
  const searchParams = useSearchParams();
  const typeCode = searchParams.get("type");
  const transactionTypeCode = searchParams.get("transaction_type") || "sell";
  const { user } = useAuth();
  const { modal } = App.useApp();
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyRequestProduct, setBuyRequestProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    if (product.transaction_type?.code === "buy") {
      setBuyRequestProduct(product);
    } else {
      setSelectedProduct(product);
      setBuyQuantity(1);
      setIsModalOpen(true);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    if (user?.users_id === selectedProduct.users?.users_id) {
      modal.warning({ title: "ไม่สามารถเพิ่มสินค้าได้", content: "คุณไม่สามารถซื้อสินค้าของตัวเองได้" });
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart({ product_id: selectedProduct.product_id, quantity: buyQuantity });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      modal.success({ title: "เพิ่มลงตะกร้าแล้ว", content: `${selectedProduct.name} x${buyQuantity}` });
      setIsModalOpen(false);
    } catch (err: any) {
      modal.error({ title: "เพิ่มไม่สำเร็จ", content: err.response?.data?.error || "เกิดข้อผิดพลาด" });
    } finally {
      setAddingToCart(false);
    }
  };

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products", "all-market", typeCode, transactionTypeCode],
    queryFn: () => getProducts({
      status: "active",
      is_admin_shop: false,
      product_type_code: typeCode || undefined,
      transaction_type_code: transactionTypeCode,
      include_shop: true,
    }),
  });

  const getProductImage = (product: Product) => {
    const firstStock = product.product_stock_card?.[0];
    if (!firstStock) return null;
    return firstStock.card?.image_name || firstStock.stock_card?.card?.image_name || null;
  };


  const renderProductCard = (product: Product) => {
    const imageName = getProductImage(product);
    const imageUrl = getCardImageUrl(imageName);

    return (
      <Col key={product.product_id} xs={24} sm={12} md={8} lg={6} xl={4}>
        <Card
          hoverable
          onClick={() => handleProductClick(product)}
          cover={
            <div className="relative h-[240px] w-full bg-gray-50 flex items-center justify-center overflow-hidden">
               <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
              />
              <div className="absolute top-2 right-2">
                <FavoriteButton productId={product.product_id} />
              </div>
            </div>
          }
          className="h-full overflow-hidden"
          styles={{ body: { padding: "12px" } }}
        >
          <div className="flex flex-col gap-1">
             <Text strong className="truncate text-base" title={product.name}>
                {product.name}
             </Text>
             
             <div className="flex flex-col mt-1">
                <div className="flex justify-between items-baseline">
                  <Text className="text-lg text-blue-600 font-semibold">
                    {product.price ? `฿${Number(product.price).toLocaleString()}` : "No Price"}
                  </Text>
                  {product.total_quantity !== undefined && (
                    <Text type="secondary" className="text-xs font-medium">
                      Qty: {product.total_quantity}
                    </Text>
                  )}
                </div>
                
                {product.market_min_price !== undefined && product.market_min_price > 0 && (
                   <Text type="secondary" className="text-[10px] leading-tight mt-0.5">
                     Market Starts at <span className="text-blue-500 font-medium">฿{product.market_min_price.toLocaleString()}</span>
                   </Text>
                )}
             </div>

             <div className="flex gap-1 mt-3">
               <Tag color="blue" className="mr-0 text-[10px] px-1.5 leading-relaxed">{product.product_type?.name}</Tag>
               {product.product_stock_card && product.product_stock_card.length > 1 && (
                 <Tag className="mr-0 text-[10px] px-1.5 leading-relaxed">+{product.product_stock_card.length - 1} cards</Tag>
               )}
             </div>
          </div>
        </Card>
      </Col>
    );
  };

  let title = "สินค้าทั้งหมด";
  if (transactionTypeCode === "buy") {
    title = "ประกาศรับซื้อทั้งหมด";
  } else if (transactionTypeCode === "trade") {
    title = "รายการแลกเปลี่ยนทั้งหมด";
  } else {
    // Sell
    title = typeCode === "single" ? "แยกใบทั้งหมด" 
    : typeCode === "plural" ? "ชุดประเภทเดี่ยวทั้งหมด"
    : typeCode === "deck" ? "ชุดหลายประเภททั้งหมด" 
    : "สินค้าทั้งหมด";
  }

  return (
    <Layout className="min-h-screen">
      <PageHeader title={title} />
      <Content className="p-4 md:p-8 container mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spin size="large" />
          </div>
        ) : isError ? (
          <Alert type="error" message="ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่อีกครั้ง" className="my-8" />
        ) : (
          <>
            <Title level={3}>{title}</Title>
            <Divider className="my-3" />
            {products.length > 0 ? (
              <Row gutter={[16, 24]}>{products.map((p: Product) => renderProductCard(p))}</Row>
            ) : (
              <div className="text-center py-20">
                <Text type="secondary">ไม่พบสินค้าในหมวดหมู่นี้</Text>
              </div>
            )}
          </>
        )}

        <BuyRequestModal
          product={buyRequestProduct}
          isOpen={!!buyRequestProduct}
          onClose={() => setBuyRequestProduct(null)}
        />

        <Modal
          title={selectedProduct?.name}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={800}
          destroyOnHidden
        >
          {selectedProduct && (
            <div className="mt-4">
              <Row gutter={24}>
                <Col span={12} className="border-r border-gray-100">
                  <Title level={5}>Cards ({selectedProduct.total_quantity} items)</Title>
                  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                    {selectedProduct.product_stock_card?.map(pc => {
                      const card = pc.stock_card?.card || pc.card;
                      const cImg = getCardImageUrl(card?.image_name);
                      return (
                        <div key={pc.product_stock_card_id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                          <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                             <Image
                              src={cImg}
                              alt={card?.name || "Card"}
                              fill
                              className="object-contain"
                              sizes="48px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text strong className="block truncate">{card?.name}</Text>
                            <div className="flex items-center gap-2 mt-1">
                              {card?.rare && <Tag className="m-0 text-[10px]" color="gold">{card.rare}</Tag>}
                              <Text type="secondary" className="text-xs">{card?.type}</Text>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <Tag color="blue" className="mb-1">x{pc.quantity}</Tag>
                            {pc.market_price != null && (
                              <div className="text-[10px] text-gray-500 whitespace-nowrap">
                                ราคาเริ่มต้น: <span className="text-blue-500 font-medium">฿{pc.market_price.toLocaleString()}</span>
                              </div>
                            )}
                            {card?.card_id && (
                                <Link href={`/market/cards/${card.card_id}`}>
                                    <Button type="link" size="small" className="p-0 h-auto text-[10px]" icon={<LineChartOutlined />}>Stats</Button>
                                </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Col>
                <Col span={12}>
                  <Title level={5}>Product Details</Title>
                  <Space orientation="vertical" size="middle" className="w-full">
                    <div>
                      <Text type="secondary" className="block text-xs text-gray-400">Shop</Text>
                      {selectedProduct.users?.shop?.shop_id ? (
                        <NavLink href={`/shops/${selectedProduct.users.shop.shop_id}`}>
                          <Text strong className="underline-offset-2 hover:underline cursor-pointer">
                            {selectedProduct.users.shop.shop_profile?.shop_name || selectedProduct.users.username || "Individual Seller"}
                          </Text>
                        </NavLink>
                      ) : (
                        <Text strong>{selectedProduct.users?.username || "Individual Seller"}</Text>
                      )}
                    </div>
                    <div>
                      <Text type="secondary" className="block text-xs">Description</Text>
                      <Text>{selectedProduct.description || "No description"}</Text>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                       <Space orientation="vertical" className="w-full">
                         <div className="flex justify-between items-center">
                            <Text type="secondary">Price</Text>
                            <Text strong className="text-lg text-blue-600">
                               ฿{selectedProduct.price ? Number(selectedProduct.price).toLocaleString() : "-"}
                            </Text>
                         </div>
                         <div className="flex justify-between items-center">
                            <Text type="secondary">คงเหลือ</Text>
                            <Text strong>{selectedProduct.quantity ?? "-"} ชิ้น</Text>
                         </div>
                         <div className="flex justify-between items-center">
                            <Text type="secondary">Product Type</Text>
                            <Tag color="blue">{selectedProduct.product_type?.name}</Tag>
                         </div>
                       </Space>
                    </div>
                    {transactionTypeCode === "sell" && (
                      <div className="flex items-center gap-3 mt-4">
                        <div>
                          <Text type="secondary" className="block text-xs mb-1">จำนวน</Text>
                          <InputNumber
                            min={1}
                            max={selectedProduct.quantity || 1}
                            value={buyQuantity}
                            onChange={(v) => setBuyQuantity(Number(v) || 1)}
                            className="w-24"
                            disabled={user?.users_id === selectedProduct.users?.users_id || (selectedProduct.quantity || 0) <= 0}
                          />
                        </div>
                        <Button
                          type="primary"
                          size="large"
                          className="flex-1"
                          icon={<ShoppingCartOutlined />}
                          onClick={handleAddToCart}
                          loading={addingToCart}
                          disabled={user?.users_id === selectedProduct.users?.users_id || (selectedProduct.quantity || 0) <= 0}
                        >
                          {user?.users_id === selectedProduct.users?.users_id
                            ? "สินค้าของคุณ"
                            : (selectedProduct.quantity || 0) <= 0
                            ? "สินค้าหมด"
                            : "เพิ่มลงตะกร้า"}
                        </Button>
                      </div>
                    )}
                  </Space>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
}

export default function AllMarketProductsPage() {
  return (
    <App>
      <Suspense fallback={
        <Layout className="min-h-screen">
          <PageHeader title="กำลังโหลด..." />
          <Content className="p-4 md:p-8 container mx-auto">
            <div className="flex justify-center items-center min-h-[400px]">
              <Spin size="large" />
            </div>
          </Content>
        </Layout>
      }>
        <AllMarketProductsContent />
      </Suspense>
    </App>
  );
}
