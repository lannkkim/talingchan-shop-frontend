"use client";

import { Layout } from "antd";
import { ReactNode } from "react";

const { Content } = Layout;

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export default function PageContainer({
  children,
  maxWidth = "7xl",
  className = "",
  contentClassName = "",
  noPadding = false,
}: PageContainerProps) {
  const paddingClass = noPadding ? "" : "p-4 md:p-8";
  
  return (
    <Layout className={`min-h-screen bg-gray-50 ${className}`}>
      <Content
        className={`container mx-auto ${maxWidthClasses[maxWidth]} ${paddingClass} ${contentClassName}`}
      >
        {children}
      </Content>
    </Layout>
  );
}
