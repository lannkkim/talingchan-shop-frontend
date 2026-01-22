"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import { Product } from "@/types/product";
import { Button } from "antd";
import SymbolGroupSection from "./SymbolGroupSection";
import PageHeader from "@/components/shared/PageHeader";
import PageContainer from "@/components/shared/PageContainer";
import PageToolbar from "@/components/shared/PageToolbar";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { FilterOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

export default function TradingMarketPage() {
  const t = useTranslations("TradingMarket");
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "trading-market"],
    queryFn: () => getProducts({ status: "active", include_shop: true }),
  });

  // Group products by Symbol
  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};

    products.forEach((product) => {
      // Logic to find symbol: Check first stock card -> card -> symbol
      const firstStock = product.product_stock_card?.[0];
      const symbol =
        firstStock?.card?.symbol ||
        firstStock?.stock_card?.cards?.symbol ||
        "Other";

      if (!groups[symbol]) {
        groups[symbol] = [];
      }
      groups[symbol].push(product);
    });

    return groups;
  }, [products]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
      />
      
      <PageContainer>
        <PageToolbar
          title={t("groupBy")}
          stats={[{ label: t("stats.products"), value: products.length }]}
          actions={
            <Button icon={<FilterOutlined />}>
              {t("actions.createTrade")}
            </Button>            
          }
        />

        <div>
          {Object.entries(groupedProducts).length > 0 ? (
            Object.entries(groupedProducts).map(([symbol, groupProducts]) => (
              <SymbolGroupSection
                key={symbol}
                symbol={symbol}
                products={groupProducts}
              />
            ))
          ) : (
            <EmptyState
              title={t("empty.title")}
              description={t("empty.description")}
            />
          )}
        </div>
      </PageContainer>
    </>
  );
}
