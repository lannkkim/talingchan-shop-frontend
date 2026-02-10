import React from "react";
import { Product } from "@/types/product";
import { Badge, Typography } from "antd";
import Image from "next/image";
import { getCardImageUrl } from "@/utils/image";

const { Text } = Typography;

interface ProductItemProps {
  product: Product;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const cardImage = product.product_stock_card?.[0]?.card?.image_name;
  const merchImage = product.product_stock_merch?.[0]?.stock_merch?.merch?.image_name;
  const imageName = cardImage || merchImage || "default_card_back";
  const imageUrl = getCardImageUrl(imageName, "thumb");
  const price = product.price;

  return (
    <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group-hover:shadow-lg transition-all">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent pt-8 text-white">
        <div className="font-bold truncate text-sm">{product.name}</div>
        <div className="flex justify-between items-center text-xs mt-1">
            <span className="opacity-90">{product.product_type?.name}</span>
            <span className="font-bold text-yellow-400">฿{Number(price || 0).toLocaleString()}</span>
        </div>
      </div>
      
      {product.status !== "active" && (
         <div className="absolute top-2 right-2">
            <Badge status={product.status === "pending" ? "processing" : "default"} text={product.status} className="bg-white/80 px-2 py-0.5 rounded-full text-xs shadow-sm" />
         </div>
      )}
    </div>
  );
};

export default ProductItem;
