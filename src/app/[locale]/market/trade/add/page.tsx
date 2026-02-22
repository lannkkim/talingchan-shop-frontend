"use client";

import TradeAddForm from "@/components/market/TradeAddForm";
import { useAuth } from "@/contexts/AuthContext";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TradeAddPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/market/trade/add");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }

  if (!isAuthenticated) {
     return null;
  }

  return (
    <TradeAddForm />
  );
}
