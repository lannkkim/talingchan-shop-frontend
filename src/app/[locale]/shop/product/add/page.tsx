"use client";

import ProductAddForm from "@/components/product/ProductAddForm";
import { useRouter } from "next/navigation";

export default function ShopAddProductPage() {
  const router = useRouter();
  
  return (
    <ProductAddForm 
      transactionType="sell" 
      onSuccess={() => router.push("/shop")}
    />
  );
}
