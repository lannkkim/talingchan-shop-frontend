"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { getProducts } from "@/services/product";
import { getAuctionProducts } from "@/services/auction";
import { addToCart } from "@/services/cart";
import { App, Card, Spin, Typography, Row, Col, Divider, ConfigProvider, Layout, Tag, Modal, Button, Space, InputNumber } from "antd";
import { ShoppingOutlined, LineChartOutlined, ShoppingCartOutlined, MessageOutlined } from "@ant-design/icons";
import { getOrCreateThread } from "@/services/chat";
import Link from "next/link";
import { Link as NavLink } from "@/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { getCardImageUrl } from "@/utils/image";
import { useAuth } from "@/contexts/AuthContext";
import TradeCarouselSection from "@/components/market/TradeCarouselSection";
import AuctionCarouselSection from "@/components/market/AuctionCarouselSection";
import FavoriteButton from "@/components/market/FavoriteButton";
import BuyRequestModal from "@/components/market/BuyRequestModal";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function MarketPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { message: antMessage } = App.useApp();

  const contactMutation = useMutation({
    mutationFn: (sellerId: string) => getOrCreateThread({ participant_id: sellerId }),
    onSuccess: (thread) => {
      setIsModalOpen(false);
      router.push(`/chat?thread=${thread.chat_thread_id}`);
    },
    onError: () => antMessage.error("ไม่สามารถเปิดแชทได้"),
  });

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyRequestProduct, setBuyRequestProduct] = useState<Product | null>(null);
  const { modal } = App.useApp();
  const queryClient = useQueryClient(); // Initialize QueryClient

  // Query for Admin/Official Store Products
  const { data: adminProducts = [], isLoading: loadingAdmin } = useQuery({
    queryKey: ["products", "market", "admin"],
    queryFn: () => getProducts({ status: "active", is_admin_shop: true, include_shop: true, transaction_type_code: "sell" }),
  });

  // Query for User/Community Market Products - Single Cards (Sell Only)
  const { data: singleProducts = [], isLoading: loadingSingle } = useQuery({
    queryKey: ["products", "market", "single"],
    queryFn: () => getProducts({
      status: "active",
      is_admin_shop: false,
      product_type_code: "single",
      transaction_type_code: "sell",
      limit: 10,
      include_shop: true,
    }),
  });

  // Query for User/Community Market Products - Bundles (Single Type Set) (Sell Only)
  const { data: pluralProducts = [], isLoading: loadingPlural } = useQuery({
    queryKey: ["products", "market", "plural"],
    queryFn: () => getProducts({
      status: "active",
      is_admin_shop: false,
      product_type_code: "plural",
      transaction_type_code: "sell",
      limit: 10,
      include_shop: true,
    }),
  });

  // Query for User/Community Market Products - Decks (Multi Type Set) (Sell Only)
  const { data: deckProducts = [], isLoading: loadingDeck } = useQuery({
    queryKey: ["products", "market", "deck"],
    queryFn: () => getProducts({
      status: "active",
      is_admin_shop: false,
      product_type_code: "deck",
      transaction_type_code: "sell",
      limit: 10,
      include_shop: true,
    }),
  });

  // Query for User/Community Market Products - Trade/Exchange
  const { data: tradeProducts = [], isLoading: loadingTrade } = useQuery({
    queryKey: ["products", "market", "trade"],
    queryFn: () => getProducts({
      status: "active",
      is_admin_shop: false,
      transaction_type_code: "trade",
      limit: 5,
      include_shop: true,
    }),
  });

  // Query for Buy Requests
  const { data: buyRequests = [], isLoading: loadingBuy } = useQuery({
    queryKey: ["products", "market", "buy"],
    queryFn: () => getProducts({
      status: "active",
      is_admin_shop: false,
      transaction_type_code: "buy",
      limit: 10,
      include_shop: true,
    }),
  });

  const { data: auctionProducts = [], isLoading: loadingAuction } = useQuery({
    queryKey: ["auction", "products", "market"],
    queryFn: getAuctionProducts,
    select: (data) => data ?? [],
  });

  const loading = loadingAdmin || loadingSingle || loadingPlural || loadingDeck || loadingTrade || loadingBuy;

  const handleProductClick = (product: Product) => {
    if (product.transaction_type?.code === "buy") {
      setBuyRequestProduct(product);
    } else {
      setSelectedProduct(product);
      setBuyQuantity(1);
      setIsModalOpen(true);
    }
  };

  const getProductImage = (product: Product) => {
    const firstStock = product.product_stock_card?.[0];
    if (!firstStock) return null;

    return firstStock.card?.image_name || firstStock.stock_card?.card?.image_name || null;
  };


  const [buyQuantity, setBuyQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    if (user?.users_id === selectedProduct.users?.users_id) {
       modal.warning({
         title: "ไม่สามารถเพิ่มสินค้าได้",
         content: "คุณไม่สามารถซื้อสินค้าของคุณเองได้",
       });
       return;
    }
    
    setAddingToCart(true);
    try {
      await addToCart({
        product_id: selectedProduct.product_id,
        quantity: buyQuantity
      });
      
      // Invalidate cart query to update the global state (including PageHeader)
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      // Optionally show success message
      modal.success({
        title: "เพิ่มสินค้าลงตะกร้าแล้ว",
        content: `เพิ่ม ${selectedProduct.name} จำนวน ${buyQuantity} รายการลงในตะกร้าเรียบร้อยแล้ว`,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      modal.error({
        title: "เพิ่มสินค้าไม่สำเร็จ",
        content: err.response?.data?.error || "เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const renderProductCard = (product: Product) => {
    const imageName = getProductImage(product);
    const imageUrl = getCardImageUrl(imageName, "thumb");
    const isBuyRequest = product.transaction_type?.code === "buy";

    return (
      <Col key={product.product_id} xs={24} sm={12} md={8} lg={6} xl={4}>
        <Card
          hoverable
          onClick={() => handleProductClick(product)}
          cover={
            <div className={`relative h-[240px] w-full flex items-center justify-center overflow-hidden ${isBuyRequest ? "bg-orange-50" : "bg-gray-50"}`}>
               <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                unoptimized
              />
              {isBuyRequest && (
                <div className="absolute top-2 left-2">
                  <Tag color="orange" className="m-0 text-[10px] font-semibold">ต้องการซื้อ</Tag>
                </div>
              )}
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
                  {isBuyRequest ? (
                    <Text className="text-lg text-green-600 font-semibold">
                      รับซื้อ ฿{Number(product.price).toLocaleString()}
                    </Text>
                  ) : (
                    <Text className="text-lg text-blue-600 font-semibold">
                      {product.price ? `฿${Number(product.price).toLocaleString()}` : "No Price"}
                    </Text>
                  )}
                  <div className="text-right">
                    {!isBuyRequest && product.quantity !== undefined && (
                      <Text strong className="text-xs block leading-tight">
                        {product.quantity} ชุด
                      </Text>
                    )}
                    {product.product_stock_card && (
                      <Text type="secondary" className="text-[10px] block leading-tight">
                        ({product.product_stock_card.reduce((sum, pc) => sum + pc.quantity, 0)} ใบ)
                      </Text>
                    )}
                  </div>
                </div>

                {!isBuyRequest && product.market_min_price !== undefined && product.market_min_price > 0 && (
                   <Text type="secondary" className="text-[10px] leading-tight mt-0.5">
                     Market Starts at <span className="text-blue-500 font-medium">฿{product.market_min_price.toLocaleString()}</span>
                   </Text>
                )}
             </div>

             <div className="flex gap-1 mt-3">
               <Tag color={isBuyRequest ? "orange" : "blue"} className="mr-0 text-[10px] px-1.5 leading-relaxed">{product.product_type?.name}</Tag>
               {product.product_stock_card && product.product_stock_card.length > 1 && (
                 <Tag className="mr-0 text-[10px] px-1.5 leading-relaxed">+{product.product_stock_card.length - 1} cards</Tag>
               )}
             </div>
          </div>
        </Card>
      </Col>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <Layout className="min-h-screen">
        <PageHeader title="ตลาด" />
        <Layout className="w-full">
          <Content className="container mx-auto max-w-7xl p-4 md:p-8">
            <div className="mb-10">
              <Title level={3} className="text-[#1890ff]">
                Official Store
              </Title>
              <Divider className="my-3" />
              {adminProducts && adminProducts.length > 0 ? (
                <Row gutter={[16, 24]}>{adminProducts.map((p: Product) => renderProductCard(p))}</Row>
              ) : (
                <Text type="secondary">No official products available.</Text>
              )}
            </div>

            <div className="mb-10">
              <Title level={3} className="text-[#1890ff]">
                Community Market
              </Title>
            </div>

            <div className="mb-10 -mx-4 md:-mx-8">
              <AuctionCarouselSection
                products={auctionProducts}
                isLoading={loadingAuction}
                title="ประมูลสินค้า"
                viewAllLink="/market/auction"
                showCoverCard={false}
                showEmptyCard={false}
              />
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center">
                <Title level={3}>แยกใบ</Title>
                <Link href="/market/products?type=single">
                  <Button type="link">ดูเพิ่มเติม</Button>
                </Link>
              </div>
              <Divider className="my-3" />
              {singleProducts && singleProducts.length > 0 ? (
                <Row gutter={[16, 24]}>{singleProducts.map((p: Product) => renderProductCard(p))}</Row>
              ) : (
                <Text type="secondary">No single cards available.</Text>
              )}
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center">
                <Title level={3}>ชุดประเภทเดี่ยว</Title>
                <Link href="/market/products?type=plural">
                  <Button type="link">ดูเพิ่มเติม</Button>
                </Link>
              </div>
              <Divider className="my-3" />
              {pluralProducts && pluralProducts.length > 0 ? (
                <Row gutter={[16, 24]}>{pluralProducts.map((p: Product) => renderProductCard(p))}</Row>
              ) : (
                <Text type="secondary">ไม่มีสินค้าในหมวดหมู่นี้</Text>
              )}
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center">
                <Title level={3}>ชุดหลายประเภท</Title>
                <Link href="/market/products?type=deck">
                  <Button type="link">ดูเพิ่มเติม</Button>
                </Link>
              </div>
              <Divider className="my-3" />
              {deckProducts && deckProducts.length > 0 ? (
                <Row gutter={[16, 24]}>{deckProducts.map((p: Product) => renderProductCard(p))}</Row>
              ) : (
                <Text type="secondary">No decks available.</Text>
              )}
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center">
                <Title level={3}>ประกาศรับซื้อล่าสุด</Title>
                <Link href="/market/products?transaction_type=buy">
                  <Button type="link">ดูเพิ่มเติม</Button>
                </Link>
              </div>
              <Divider className="my-3" />
              {buyRequests && buyRequests.length > 0 ? (
                <Row gutter={[16, 24]}>{buyRequests.map((p: Product) => renderProductCard(p))}</Row>
              ) : (
                <Text type="secondary">No buy requests available.</Text>
              )}
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center">
                <Title level={3}>แลกเปลี่ยนสินค้า</Title>
                <Link href="/market/trade">
                  <Button type="link">ดูเพิ่มเติม</Button>
                </Link>
              </div>
              <Divider className="my-3" />
               <TradeCarouselSection 
                  products={tradeProducts} 
                  isLoading={loadingTrade} 
                  title="แลกเปลี่ยนสินค้า"
                  hideHeader={true}
                  className="!py-0"
                  onProductClick={() => router.push("/market/trade")}
               />
            </div>

            {/* Buy Request Modal */}
            <BuyRequestModal
              product={buyRequestProduct}
              isOpen={!!buyRequestProduct}
              onClose={() => setBuyRequestProduct(null)}
            />

            {/* Product Details Modal */}
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
                    {/* Left Column: Cards List */}
                    <Col span={12} className="border-r border-gray-100">
                      <Title level={5} className="mb-4">Cards ({selectedProduct.product_stock_card?.reduce((sum, pc) => sum + pc.quantity, 0) || 0} items)</Title>
                      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                        {selectedProduct.product_stock_card?.map(pc => {
                          const card = pc.stock_card?.card || pc.card;
                          return (
                            <div key={pc.product_stock_card_id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                              <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src={getCardImageUrl(card?.image_name, "thumb")}
                                  alt={card?.name || "Card"}
                                  fill
                                  className="object-contain"
                                  sizes="48px"
                                  unoptimized
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Text strong className="block truncate" title={card?.name}>{card?.name}</Text>
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
                                <Link href={card?.card_id ? `/market/cards/${card.card_id}` : "#"}>
                                  <Button type="link" size="small" className="p-0 h-auto text-[10px]" icon={<LineChartOutlined />}>ข้อมูลตลาด</Button>
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Col>

                    {/* Right Column: Product and Shop Details */}
                    <Col span={12}>
                      <Title level={5} className="mb-4">Details</Title>
                      <Space orientation="vertical" size="middle" className="w-full">
                        <div>
                      <Text type="secondary" className="block text-xs">Description</Text>
                      <Text>{selectedProduct.description || "No description"}</Text>
                    </div>

                        <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                           <Space orientation="vertical" className="w-full">
                             <div className="flex justify-between items-center">
                                <Text type="secondary">Price</Text>
                                <Text strong className="text-xl text-blue-600">฿{Number(selectedProduct.price).toLocaleString()}</Text>
                             </div>
                             <div className="flex justify-between items-center">
                                <Text type="secondary">In Stock</Text>
                                <Text strong>{selectedProduct.quantity || 0} {selectedProduct.product_type?.code === "single" ? "ถาด/ใบ" : "ชุด"}</Text>
                             </div>
                             <div className="flex justify-between items-center">
                                <Text type="secondary">Cards per Set</Text>
                                <Text strong>{selectedProduct.product_stock_card?.reduce((sum, pc) => sum + pc.quantity, 0) || 0} cards</Text>
                             </div>
                           </Space>
                        </div>

                        <Divider className="my-2" />

                        <div>
                          <Text type="secondary" className="block text-xs uppercase tracking-wider mb-3">Shop Information</Text>
                          {selectedProduct.is_admin_shop ? (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                 T
                               </div>
                               <div>
                                 <Text strong className="block">Talingchan Official</Text>
                                 <Text type="secondary" className="text-xs">Verified Store</Text>
                               </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                               <NavLink href={selectedProduct.users?.shop?.shop_id ? `/shops/${selectedProduct.users.shop.shop_id}` : "#"} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                 <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                                   {selectedProduct.users?.shop?.shop_profile?.shop_name?.charAt(0) || selectedProduct.users?.username?.charAt(0) || "U"}
                                 </div>
                                 <div>
                                   <Text strong className="block underline-offset-2 hover:underline">{selectedProduct.users?.shop?.shop_profile?.shop_name || selectedProduct.users?.username || "Community Member"}</Text>
                                   <Text type="secondary" className="text-xs">
                                     Seller: {selectedProduct.users?.first_name} {selectedProduct.users?.last_name}
                                   </Text>
                                 </div>
                               </NavLink>
                               {(() => {
                                 const sellerUserId = selectedProduct.user_id ?? selectedProduct.users?.users_id;
                                 return user && sellerUserId && user.users_id !== sellerUserId && (
                                   <Button
                                     size="small"
                                     icon={<MessageOutlined />}
                                     loading={contactMutation.isPending}
                                     onClick={() => contactMutation.mutate(sellerUserId)}
                                   >
                                     ติดต่อร้านค้า
                                   </Button>
                                 );
                               })()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex-shrink-0">
                            <Text type="secondary" className="block text-xs mb-1">Quantity</Text>
                            <InputNumber 
                              min={1} 
                              max={selectedProduct.quantity || 1} 
                              value={buyQuantity} 
                              onChange={(val) => setBuyQuantity(Number(val) || 1)}
                              className="w-24"
                              disabled={user?.users_id === selectedProduct.users?.users_id || (selectedProduct.quantity || 0) <= 0}
                            />
                          </div>
                          <Button 
                            type="primary" 
                            size="large" 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:border-gray-300" 
                            icon={user?.users_id === selectedProduct.users?.users_id ? undefined : <ShoppingCartOutlined />}
                            onClick={handleAddToCart}
                            loading={addingToCart}
                            disabled={user?.users_id === selectedProduct.users?.users_id || (selectedProduct.quantity || 0) <= 0}
                          >
                            {user?.users_id === selectedProduct.users?.users_id ? "สินค้าของคุณ" : (selectedProduct.quantity || 0) <= 0 ? "สินค้าหมด" : "เพิ่มสินค้าลงตะกร้า"}
                          </Button>
                        </div>
                      </Space>
                    </Col>
                  </Row>
                </div>
              )}
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
