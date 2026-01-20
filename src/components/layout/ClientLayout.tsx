"use client";

import React from "react";
import { ConfigProvider, App } from "antd";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { algorithm } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm,
        token: {
          fontFamily: `var(--font-inter), var(--font-noto-sans-thai), sans-serif`,
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ThemedApp>{children}</ThemedApp>
    </ThemeProvider>
  );
}
