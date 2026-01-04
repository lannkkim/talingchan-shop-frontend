"use client";

import React, { useMemo, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getCards } from "@/services/card";
import { Card as CardType } from "@/types/card";
import CardItem from "@/components/shared/CardItem";
import { Row, Col, Skeleton, Empty, Spin, Space, Typography, Checkbox, Radio } from "antd";

const { Text } = Typography;

const LIMIT = 20;

interface CardSelectorProps {
  onSelect?: (cards: CardType[]) => void;
  selectedCards?: CardType[];
  multiple?: boolean;
  selectable?: boolean;
  renderCustomActions?: (card: CardType, isSelected: boolean) => React.ReactNode;
}

const CardSelector: React.FC<CardSelectorProps> = ({
  onSelect,
  selectedCards = [],
  multiple = false,
  selectable = true,
  renderCustomActions,
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
    queryKey: ["cards"],
    queryFn: ({ pageParam = 1 }) => getCards(pageParam as number, LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === LIMIT ? allPages.length + 1 : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allCards = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  const sortedCards = useMemo(() => {
    return [...allCards].sort((a, b) => a.cards_id - b.cards_id);
  }, [allCards]);

  const handleToggleSelect = (card: CardType) => {
    if (!selectable || !onSelect) return;
    
    if (multiple) {
      const isSelected = selectedCards.find((c) => c.cards_id === card.cards_id);
      if (isSelected) {
        onSelect(selectedCards.filter((c) => c.cards_id !== card.cards_id));
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
        {sortedCards.map((card) => {
          const isSelected = !!selectedCards.find((c) => c.cards_id === card.cards_id);
          return (
            <Col key={card.cards_id} xs={12} sm={8} md={6}>
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
        {isFetchingNextPage ? (
          <Space className="w-full justify-center">
            <Spin />
            <Text type="secondary">Loading more...</Text>
          </Space>
        ) : hasNextPage ? (
          <Text type="secondary">Scroll for more</Text>
        ) : sortedCards.length > 0 ? (
          <Text type="secondary" italic>No more cards</Text>
        ) : null}
      </div>
    </div>
  );
};

export default CardSelector;
