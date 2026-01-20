import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/antd";
import QueryProvider from "@/lib/query";
import { ConfigProvider, App } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";

const notoSans = localFont({
  src: [
    {
      path: "../../public/Noto_Sans/NotoSans-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "../../public/Noto_Sans/NotoSans-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-noto-sans",
});

const notoSansThai = localFont({
  src: "../../public/Noto_Sans_Thai/NotoSansThai-VariableFont_wdth,wght.ttf",
  display: "swap",
  variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
  title: "Talingchan Shop",
  description: "Your destination for premium card games and collectibles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${notoSansThai.variable} antialiased`}
      >
        <QueryProvider>
          <StyledComponentsRegistry>
            <ConfigProvider
              theme={{
                token: {
                  fontFamily: `var(--font-noto-sans), var(--font-noto-sans-thai), sans-serif`,
                },
              }}
            >
              <AuthProvider>
                <App>{children}</App>
              </AuthProvider>
            </ConfigProvider>
          </StyledComponentsRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
