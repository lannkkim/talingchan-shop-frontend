"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Empty, Spin, Button, Tag, App } from "antd";
import { HeartFilled } from "@ant-design/icons";
import { getMyFavorites, removeFavorite } from "@/services/favorite";
import type { Favorite } from "@/types/favorite";
import { formatCurrency } from "@/utils/format";
import { getCardImageUrl } from "@/utils/image";
import { Link } from "@/navigation";
import Image from "next/image";

export default function FavoritesList() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", "me"],
    queryFn: getMyFavorites,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFavorite(productId),
    onSuccess: () => {
      message.success("ลบออกจากรายการโปรดแล้ว");
      queryClient.invalidateQueries({ queryKey: ["favorites", "me"] });
    },
    onError: () => message.error("เกิดข้อผิดพลาด"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Empty
        description="ยังไม่มีสินค้าในรายการโปรด"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-12"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {favorites.map((fav: Favorite) => {
        const product = fav.product;
        const firstCard = product?.product_stock_card?.[0];
        const imageName =
          firstCard?.card?.image_name || firstCard?.stock_card?.card?.image_name;

        return (
          <div
            key={fav.favorite_id}
            className="border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <Link href={`/market/products/${fav.product_id}`}>
              <div className="relative aspect-[3/4] bg-gray-50">
                <Image
                  src={getCardImageUrl(imageName, "medium")}
                  alt={product?.name || "สินค้า"}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized
                />
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{product?.name}</p>
                <p className="text-base font-bold mt-1">
                  {formatCurrency(product?.price || "0")}
                </p>
                {product?.sell_type && (
                  <Tag className="mt-1 text-xs">{product.sell_type}</Tag>
                )}
              </div>
            </Link>
            <div className="px-3 pb-3">
              <Button
                danger
                size="small"
                icon={<HeartFilled />}
                block
                onClick={() => removeMutation.mutate(fav.product_id)}
                loading={removeMutation.isPending}
              >
                นำออก
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
