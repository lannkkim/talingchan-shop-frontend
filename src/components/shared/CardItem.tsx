import React from "react";
import Image from "next/image";
import { Card as CardType } from "@/types/card";
import { getCardImageUrl } from "@/utils/image";
import { Card, Tag, Typography, Space } from "antd";

const { Text, Title } = Typography;

interface CardItemProps {
  card: CardType;
}

const CardItem: React.FC<CardItemProps> = ({ card }) => {
  const imageUrl = getCardImageUrl(card.image_name);

  return (
    <Card
      hoverable
      cover={
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-50 rounded-t-lg">
          <Image
            src={imageUrl}
            alt={card.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        </div>
      }
      styles={{ body: { padding: "12px" } }}
      className="border-gray-100 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <Title level={5} className="!mb-0 !text-sm truncate" title={card.name}>
          {card.name}
        </Title>
        <Space size={[0, 4]} wrap className="mt-1">
          <Tag color="blue" className="text-[10px] m-0 leading-none py-1">
            {card.type}
          </Tag>
          <Tag color="orange" className="text-[10px] m-0 leading-none py-1">
            {card.rare}
          </Tag>
        </Space>
        {card.print && (
          <Text type="secondary" className="text-[10px] mt-1 block truncate">
            {card.print}
          </Text>
        )}
      </div>
    </Card>
  );
};

export default CardItem;
