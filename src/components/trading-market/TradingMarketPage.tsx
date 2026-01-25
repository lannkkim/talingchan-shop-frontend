"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product";
import { getTradeLists } from "@/services/tradeList";
import { Product } from "@/types/product";
import { Button, Tabs } from "antd";
import SymbolGroupSection from "./SymbolGroupSection";
import PageHeader from "@/components/shared/PageHeader";
import PageContainer from "@/components/shared/PageContainer";
import PageToolbar from "@/components/shared/PageToolbar";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import CreateTradeModal from "./CreateTradeModal";
import TradeListView from "./TradeListView";
import { PlusOutlined, SwapOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";

export default function TradingMarketPage() {
  const t = useTranslations("TradingMarket");
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "trading-market"],
    queryFn: () => getProducts({ 
      status: "active", 
      include_shop: true
    }),
  });

  const { data: tradeLists = [], isLoading: loadingTradeLists } = useQuery({
    queryKey: ["trade-lists"],
    queryFn: () => getTradeLists(),
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

  const isLoading = loadingProducts || loadingTradeLists;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const tabItems = [
    {
      key: "browse",
      label: (
        <span className="flex items-center gap-2">
          <SwapOutlined />
          {t("tabs.browse")}
        </span>
      ),
      children: (
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
      ),
    },
    {
      key: "my-trades",
      label: (
        <span className="flex items-center gap-2">
          <SwapOutlined />
          {t("tabs.myTrades")}
        </span>
      ),
      children: <TradeListView tradeLists={tradeLists.filter(tl => 
        tl.trade_product && user && tl.trade_product.product_id === user.users_id
      )} />,
    },
    {
      key: "all-trades",
      label: (
        <span className="flex items-center gap-2">
          <SwapOutlined />
          {t("tabs.allTrades")}
        </span>
      ),
      children: <TradeListView tradeLists={tradeLists} />,
    },
  ];

  return (
    <>
      <PageHeader 
        title={t("title")}
        subtitle={t("subtitle")}
      />
      
      <PageContainer>
        <PageToolbar
          title={activeTab === "browse" ? t("groupBy") : t("tabs.tradeList")}
          stats={[
            { label: t("stats.products"), value: products.length },
            { label: t("stats.tradeLists"), value: tradeLists.length }
          ]}
          actions={
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              {t("actions.createTrade")}
            </Button>            
          }
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="trading-market-tabs"
        />
      </PageContainer>

      <CreateTradeModal 
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}
