"use client";

import { Button } from "antd";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { useFavorite } from "@/hooks/useFavorite";
import { useAuth } from "@/contexts/AuthContext";

interface FavoriteButtonProps {
  productId: string;
  size?: "small" | "middle" | "large";
  showText?: boolean;
}

export default function FavoriteButton({
  productId,
  size = "small",
  showText = false,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggle, isPending } = useFavorite(productId);

  if (!isAuthenticated) return null;

  return (
    <Button
      type="text"
      size={size}
      icon={
        isFavorite ? (
          <HeartFilled className="text-red-500" />
        ) : (
          <HeartOutlined className="text-gray-400 hover:text-red-400" />
        )
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      loading={isPending}
      className="flex items-center"
    >
      {showText && (isFavorite ? "ถูกใจแล้ว" : "ถูกใจ")}
    </Button>
  );
}
