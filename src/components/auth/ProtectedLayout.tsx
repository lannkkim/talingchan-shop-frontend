"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin, Layout } from "antd";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/?login=true");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <Spin size="large" fullscreen tip="Loading..." />;
  }

  if (!isAuthenticated) {
    return null; // Or a tailored "Access Denied" view
  }

  return <>{children}</>;
}
