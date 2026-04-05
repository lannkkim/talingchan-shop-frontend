"use client";

import React, { useState } from "react";
import CardBrowser from "@/components/shared/CardBrowser";
import CardPriceBadge from "@/components/shared/CardPriceBadge";
import CardDetailModal from "@/components/shared/CardDetailModal";
import PageHeader from "@/components/shared/PageHeader";
import { Layout, ConfigProvider } from "antd";
import { Card } from "@/types/card";

const { Content } = Layout;

export default function CardsPage() {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <Layout className="min-h-screen bg-white">
        <PageHeader title="คลัง" />

        <Layout className="w-full">
          <Content className="container mx-auto max-w-7xl p-4 md:p-8">
            <CardBrowser
              selectable={false}
              onCardClick={(card) => setSelectedCard(card)}
              renderCustomActions={(card) => (
                <CardPriceBadge cardId={card.card_id} />
              )}
            />
          </Content>
        </Layout>
      </Layout>

      <CardDetailModal
        card={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </ConfigProvider>
  );
}
