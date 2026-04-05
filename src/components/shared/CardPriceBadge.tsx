"use client";

import { useQuery } from "@tanstack/react-query";
import { getCardAnalytics } from "@/services/card";

interface CardPriceBadgeProps {
  cardId: string;
}

export default function CardPriceBadge({ cardId }: CardPriceBadgeProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["card", cardId, "analytics"],
    queryFn: () => getCardAnalytics(cardId),
    staleTime: 5 * 60 * 1000, // cache 5 minutes
    select: (data) => data ?? null,
  });

  if (isLoading) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center">
        <span className="text-white text-xs">...</span>
      </div>
    );
  }

  if (!data || data.min_price === 0) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-center">
        <span className="text-white/60 text-[10px]">ไม่มีสินค้าขาย</span>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1.5 text-center">
      <span className="text-[10px] text-white/70 block leading-none mb-0.5">ราคาเริ่มต้น</span>
      <span className="text-white font-semibold text-xs">
        ฿{data.min_price.toLocaleString()}
      </span>
    </div>
  );
}
