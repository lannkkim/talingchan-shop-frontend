"use client";

import ProtectedLayout from "@/components/auth/ProtectedLayout";

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
