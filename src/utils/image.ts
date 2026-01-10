const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const getCardImageUrl = (
  imageName: string | null | undefined
): string => {
  return imageName
    ? `${API_URL}/uploads/${
        imageName.endsWith(".png") ? imageName : `${imageName}.png`
      }`
    : "/images/card-placeholder.png";
};
