"use client";

import ProductAddFormV2 from "@/components/product/ProductAddFormV2";
import { useRouter } from "next/navigation";

export default function ShopAddProductPage() {
  const router = useRouter();

  return (
    <ProductAddFormV2
      transactionType="sell"
      onSuccess={() => router.push("/shop")}
    />
  );
}
