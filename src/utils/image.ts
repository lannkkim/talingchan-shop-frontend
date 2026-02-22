import { Product } from "@/types/product";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

export type ImageSize = "thumb" | "medium" | "original";

export const getCardImageUrl = (
  imageName: string | null | undefined,
  size: ImageSize = "medium",
): string => {
  if (!imageName) return "/images/card-placeholder.png";

  // Strip .png extension if present
  const baseName = imageName.replace(/\.png$/i, "");

  // Return optimized WebP URL
  return `${API_URL}/images/cards/${encodeURIComponent(baseName)}/${size}.webp`;
};

export const getProductImage = (
  product: any,
  size: ImageSize = "medium",
): string => {
  if (!product) return "/images/card-placeholder.png";

  // If it's a snapshot or has direct image_name
  if (product.image_name) {
    return getCardImageUrl(product.image_name, size);
  }

  // Fallback to stock cards (full Product)
  const firstStock = product.product_stock_card?.[0];
  if (firstStock) {
    const imageName =
      firstStock.card?.image_name || firstStock.stock_card?.card?.image_name;
    if (imageName) return getCardImageUrl(imageName, size);
  }

  return "/images/card-placeholder.png";
};
