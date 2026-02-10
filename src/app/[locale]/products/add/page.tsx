"use client";

import ProductAddFormV2 from "@/components/product/ProductAddFormV2";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

  return (
    <ProductAddFormV2
      transactionType="buy"
      onSuccess={() => router.push("/market")} 
    />
  );
}
