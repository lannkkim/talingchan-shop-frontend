import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import { getCards } from "@/services/card";
import { Product } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useMarketPage() {
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: cards = [], isLoading: isLoadingCards } = useQuery({
    queryKey: ["cards", "market"],
    queryFn: () => getCards(1, 20),
  });

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

  return {
    products,
    isLoadingProducts,
    cards,
    isLoadingCards,
    carouselRef,
    canScrollLeft,
    canScrollRight,
    categoryItems,
    getCardImageUrl,
    getProductImage,
    getActivePrice,
    handleScroll,
    scroll,
  };
}
