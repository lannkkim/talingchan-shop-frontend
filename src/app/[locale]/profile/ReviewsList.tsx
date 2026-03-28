"use client";

import { useQuery } from "@tanstack/react-query";
import { Empty, Spin, Rate, Typography, Tag } from "antd";
import { getMyReviews } from "@/services/review";
import type { Review } from "@/types/review";
import { formatDate } from "@/utils/format";

const { Text } = Typography;

export default function ReviewsList() {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", "me"],
    queryFn: getMyReviews,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Empty
        description="ยังไม่มีรีวิว"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: Review) => (
        <div
          key={review.review_id}
          className="border border-gray-100 p-4 space-y-2"
        >
          <div className="flex justify-between items-start">
            <Rate disabled defaultValue={review.rating} className="text-sm" />
            <Text type="secondary" className="text-xs">
              {formatDate(review.created_at)}
            </Text>
          </div>
          {review.comment && <Text className="block">{review.comment}</Text>}
          <div>
            <Tag className="text-xs">Order #{review.order_id.substring(0, 8)}</Tag>
          </div>
        </div>
      ))}
    </div>
  );
}
