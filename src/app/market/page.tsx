"use client";

import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import { getCards } from "@/services/card";
import {
  Layout,
  Typography,
  Button,
  Card,
  Skeleton,
  Tag,
  Dropdown,
} from "antd";
import { MenuOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { Card as CardType } from "@/types/card";
import PageHeader from "@/components/shared/PageHeader";

const { Content } = Layout;
const { Text, Title } = Typography;

export default function MaketPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: cards = [], isLoading: isLoadingCards } = useQuery({
    queryKey: ["cards", "market"],
    queryFn: () => getCards(1, 20),
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getCardImageUrl = (imageName: string | null | undefined) => {
    return imageName
      ? `${API_URL}/uploads/cards/${
          imageName.endsWith(".png") ? imageName : `${imageName}.png`
        }`
      : "/images/card-placeholder.png";
  };

  const getProductImage = (product: Product) => {
    const firstCard = product.product_stock_card?.[0]?.stock_card?.cards;
    return getCardImageUrl(firstCard?.image_name);
  };

  const getActivePrice = (product: Product) => {
    const activePrice =
      product.price_period?.find((p) => p.status === "active") ||
      product.price_period?.[0];
    return activePrice ? Number(activePrice.price) : null;
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const categoryItems = [
    { key: "cards", label: "Card Games" },
    { key: "figures", label: "Figures" },
    { key: "accessories", label: "Accessories" },
    { key: "apparel", label: "Apparel" },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <PageHeader title="Market" />

      {/* Categories Bar
      <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-2">
        <Dropdown menu={{ items: categoryItems }} trigger={["click"]}>
          <Button icon={<MenuOutlined />} className="flex items-center gap-2">
            Categories
          </Button>
        </Dropdown>
      </div> */}

      <Content>
        {/* Hero Banner */}
        <div className="relative w-full h-[300px] lg:h-[400px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200">
            {/* Placeholder for banner image */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Title
                  level={1}
                  className="!text-4xl lg:!text-6xl !mb-2 font-bold"
                >
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    ตาลิ่ง-shirt
                  </span>{" "}
                  <span className="text-gray-700">collection</span>
                </Title>
                <Tag color="orange" className="text-lg px-4 py-1">
                  Vol.2
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {/* Product Section */}
        <div className="container mx-auto ">
          {/* Product Carousel */}
          <div className="relative">
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide "
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="flex-shrink-0 w-[200px]">
                      <Skeleton.Image active className="!w-full !h-[250px]" />
                      <Skeleton
                        active
                        paragraph={{ rows: 2 }}
                        className="mt-4"
                      />
                    </Card>
                  ))
                : products.map((product) => (
                    <Link
                      href={`/products/${product.product_id}`}
                      key={product.product_id}
                    >
                      <Card
                        hoverable
                        className="flex-shrink-0 w-[200px] overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                        cover={
                          <div className="relative h-[250px] bg-gray-100">
                            <Image
                              src={getProductImage(product)}
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                              sizes="200px"
                            />
                            {/* NEW Badge */}
                            {product.status === "active" && (
                              <Tag
                                color="red"
                                className="absolute bottom-2 left-2 m-0 font-bold"
                              >
                                NEW
                              </Tag>
                            )}
                            {/* More than Card Badge */}
                            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded px-2 py-1">
                              <Text className="text-[10px] text-gray-600">
                                &quot;MORE THAN CARD&quot;
                              </Text>
                            </div>
                          </div>
                        }
                        styles={{ body: { padding: "12px" } }}
                      >
                        <Text className="text-sm text-gray-700 line-clamp-2 h-10">
                          {product.name}
                        </Text>
                        {getActivePrice(product) && (
                          <Text strong className="text-blue-600 mt-2 block">
                            ฿{getActivePrice(product)?.toLocaleString()}
                          </Text>
                        )}
                      </Card>
                    </Link>
                  ))}
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="w-full py-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 px-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">🃏</span>
              </div>
              <Title level={4} className="!mb-0 ">
                Featured Cards
              </Title>
            </div>
            <Link
              href="/cards"
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              View all
            </Link>
          </div>

          {/* Cards Grid */}
          <div
            className="flex gap-4 overflow-x-auto scrollbar-hide py-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isLoadingCards
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="flex-shrink-0 w-[300px]">
                    <Skeleton.Image active className="!w-full !h-[400px]" />
                    <Skeleton active paragraph={{ rows: 2 }} className="mt-4" />
                  </Card>
                ))
              : cards.map((card: CardType) => (
                  <Card
                    key={card.card_id}
                    hoverable
                    className="flex-shrink-0 w-[300px] overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                    cover={
                      <div className="relative h-[300px] bg-gray-100">
                        <Image
                          src={getCardImageUrl(card.image_name)}
                          alt={card.name}
                          fill
                          className="object-contain p-2"
                          sizes="240px"
                        />
                        {card.rare && (
                          <Tag
                            color="gold"
                            className="absolute top-2 left-2 m-0 font-bold"
                          >
                            {card.rare}
                          </Tag>
                        )}
                      </div>
                    }
                    styles={{ body: { padding: "12px" } }}
                  >
                    <Text className="text-sm text-gray-700 line-clamp-2 h-10 font-medium">
                      {card.name}
                    </Text>
                    <div className="flex items-center gap-2 mt-2">
                      {card.color && (
                        <Tag color="blue" className="m-0 text-xs">
                          {card.color}
                        </Tag>
                      )}
                      {card.type && (
                        <Tag color="purple" className="m-0 text-xs">
                          {card.type}
                        </Tag>
                      )}
                    </div>
                  </Card>
                ))}
          </div>
        </div>

        {/* Additional Sections Placeholder */}
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured Categories */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 hover:shadow-lg transition-shadow">
              <Title level={5} className="!text-blue-800">
                Featured Cards
              </Title>
              <Text className="text-blue-600">
                Explore our best selling cards
              </Text>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 hover:shadow-lg transition-shadow">
              <Title level={5} className="!text-purple-800">
                New Arrivals
              </Title>
              <Text className="text-purple-600">
                Check out the latest additions
              </Text>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 hover:shadow-lg transition-shadow">
              <Title level={5} className="!text-orange-800">
                Special Offers
              </Title>
              <Text className="text-orange-600">Limited time deals</Text>
            </Card>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Title level={5} className="!text-white !mb-4">
                TALINGCHAN
              </Title>
              <Text className="text-gray-400">
                Your destination for premium card games and collectibles.
              </Text>
            </div>
            <div>
              <Title level={5} className="!text-white !mb-4">
                Quick Links
              </Title>
              <div className="flex flex-col gap-2">
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>
            <div>
              <Title level={5} className="!text-white !mb-4">
                Categories
              </Title>
              <div className="flex flex-col gap-2">
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Card Games
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Figures
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Accessories
                </Link>
              </div>
            </div>
            <div>
              <Title level={5} className="!text-white !mb-4">
                Follow Us
              </Title>
              <Text className="text-gray-400">
                Stay connected on social media
              </Text>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <Text className="text-gray-500">
              © 2026 Talingchan Shop. All rights reserved.
            </Text>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
