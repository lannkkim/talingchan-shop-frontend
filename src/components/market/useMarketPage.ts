import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import { getCards } from "@/services/card";
import { Product } from "@/types/product";
import { getCardImageUrl } from "@/utils/image";

export function useMarketPage() {
  const { data: productsRaw, isLoading: isLoadingProducts } = useQuery<
    Product[]
  >({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
  const products = productsRaw || [];

  const { data: cardsRaw, isLoading: isLoadingCards } = useQuery({
    queryKey: ["cards", "market"],
    queryFn: () => getCards(1, 20),
  });
  const cards = cardsRaw || [];

  const { data: tradeProductsRaw, isLoading: isLoadingTrades } = useQuery({
    queryKey: ["products", "market", "trade", "landing"],
    queryFn: () =>
      getProducts({
        status: "active",
        transaction_type_code: "trade",
        include_shop: true,
        limit: 5,
      }),
  });
  const tradeProducts = tradeProductsRaw || [];

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getProductImage = (product: Product) => {
    const firstStock = product.product_stock_card?.[0];
    if (!firstStock) return "/images/card-placeholder.png";

    const imageName =
      firstStock.card?.image_name || firstStock.stock_card?.card?.image_name;
    return getCardImageUrl(imageName);
  };

  const getActivePrice = (product: Product) => {
    return product.price ? Number(product.price) : null;
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
    tradeProducts,
    isLoadingTrades,
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
