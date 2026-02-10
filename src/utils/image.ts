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
  return `${API_URL}/images/cards/${baseName}/${size}.webp`;
};
