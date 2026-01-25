"use client";

import React, { useMemo, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getCards, CardFilters } from "@/services/card";
import { Card as CardType } from "@/types/card";
import CardItem from "@/components/shared/CardItem";
import { Row, Col, Skeleton, Empty, Spin, Space, Typography, Checkbox, Radio } from "antd";

const { Text } = Typography;

const LIMIT = 20;

export interface CardSelectorProps {
  onSelect?: (cards: CardType[]) => void;
  selectedCards?: CardType[];
  multiple?: boolean;
  selectable?: boolean;
  renderCustomActions?: (card: CardType, isSelected: boolean) => React.ReactNode;
  filters?: CardFilters;
  availableCards?: CardType[] | null; // If provided, use this instead of fetching
}

const CardSelector: React.FC<CardSelectorProps> = ({
  onSelect,
  selectedCards = [],
  multiple = false,
  selectable = true,
  renderCustomActions,
  filters,
  availableCards,
}) => {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["cards", filters],
    queryFn: ({ pageParam = 1 }) => getCards(pageParam as number, LIMIT, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === LIMIT ? allPages.length + 1 : undefined;
    },
    enabled: !availableCards, // Only fetch if availableCards not provided
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allCards = useMemo(() => {
    if (availableCards) {
      // Use provided cards and apply search filter if present
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return availableCards.filter(card => 
          card.name.toLowerCase().includes(searchLower)
        );
      }
      return availableCards;
    }
    return data?.pages.flat() || [];
  }, [data, availableCards, filters?.search]);

  const sortedCards = useMemo(() => {
    return [...allCards].sort((a, b) => String(a.print).localeCompare(String(b.print)));
  }, [allCards]);

  const handleToggleSelect = (card: CardType) => {
    if (!selectable || !onSelect) return;
    
    if (multiple) {
      const isSelected = selectedCards.find((c) => c.card_id === card.card_id);
      if (isSelected) {
        onSelect(selectedCards.filter((c) => c.card_id !== card.card_id));
      } else {
        onSelect([...selectedCards, card]);
      }
    } else {
      onSelect([card]);
    }
  };

  if (isLoading) {
    return (
      <Row gutter={[16, 24]}>
        {[...Array(6)].map((_, index) => (
          <Col key={index} xs={12} sm={8} md={6}>
            <Skeleton.Image className="!w-full !h-48 mb-2" active />
            <Skeleton active paragraph={{ rows: 1 }} />
          </Col>
        ))}
      </Row>
    );
  }

  if (isError) {
    return <Empty description="Failed to load cards" />;
  }

  return (
    <div className="space-y-6">
      <Row gutter={[16, 24]}>
        {sortedCards.map((card, index) => {
          const isSelected = !!selectedCards.find((c) => c.card_id === card.card_id);
          // Use stock_card_id if available (from inventory), otherwise use card_id
          const uniqueKey = (card as any).stock_card_id || card.card_id;
          return (
            <Col key={`${uniqueKey}-${index}`} xs={12} sm={8} md={6}>
              <div 
                className={`relative transition-all duration-200 rounded-xl overflow-hidden group ${
                  selectable ? "cursor-pointer" : ""
                } ${
                  selectable && isSelected
                    ? "ring-4 ring-blue-500 ring-offset-2 scale-[1.02]" 
                    : "hover:scale-[1.01]"
                }`}
                onClick={() => handleToggleSelect(card)}
              >
                <CardItem card={card} />
                {selectable && (
                  <div className="absolute top-2 right-2 z-10 transition-transform duration-200">
                    {multiple ? (
                      <Checkbox checked={isSelected} className="scale-125" />
                    ) : (
                      <Radio checked={isSelected} className="scale-125" />
                    )}
                  </div>
                )}
                {renderCustomActions && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderCustomActions(card, isSelected)}
                  </div>
                )}
              </div>
            </Col>
          );
        })}
      </Row>

      <div ref={ref} className="py-8 flex justify-center w-full min-h-[50px]">
        {!availableCards && isFetchingNextPage ? (
          <Space className="w-full justify-center">
            <Spin />
            <Text type="secondary">Loading more...</Text>
          </Space>
        ) : !availableCards && hasNextPage ? (
          <Text type="secondary">Scroll for more</Text>
        ) : sortedCards.length > 0 ? (
          <Text type="secondary" italic>{availableCards ? "" : "No more cards"}</Text>
        ) : (
          <Empty description={availableCards ? "No cards in stock" : "No cards found"} />
        )}
      </div>
    </div>
  );
};

export default CardSelector;
