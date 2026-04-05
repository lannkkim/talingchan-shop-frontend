"use client";

import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useFavorite } from "@/hooks/useFavorite";
import { useAuth } from "@/contexts/AuthContext";

interface FavoriteButtonProps {
  productId: string;
  size?: "small" | "middle";
}

export default function FavoriteButton({ productId, size = "small" }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggle, isPending } = useFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    toggle();
  };

  return (
    <Tooltip title={!isAuthenticated ? "กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด" : isFavorite ? "ลบจากรายการโปรด" : "บันทึกรายการโปรด"}>
      <Button
        type="text"
        size={size}
        shape="circle"
        icon={isFavorite
          ? <HeartFilled style={{ color: "#ff4d4f" }} />
          : <HeartOutlined style={{ color: isAuthenticated ? "#ff4d4f" : "#bfbfbf" }} />
        }
        loading={isPending}
        onClick={handleClick}
        disabled={!isAuthenticated}
        style={{ background: "rgba(255,255,255,0.85)" }}
      />
    </Tooltip>
  );
}
