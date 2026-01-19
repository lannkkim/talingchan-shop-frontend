import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";

const inter = localFont({
  src: [
    {
      path: "../../../public/Inter/Inter-VariableFont_opsz,wght.ttf",
      style: "normal",
    },
    {
      path: "../../../public/Inter/Inter-Italic-VariableFont_opsz,wght.ttf",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-inter",
});

const notoSansThai = localFont({
  src: "../../../public/Noto_Sans_Thai/NotoSansThai-VariableFont_wdth,wght.ttf",
  display: "swap",
  variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
  title: "Talingchan Shop",
  description: "Your destination for premium card games and collectibles",
};

import StyledComponentsRegistry from "@/lib/antd";
import QueryProvider from "@/lib/query";
import ClientLayout from "@/components/layout/ClientLayout";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSansThai.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <StyledComponentsRegistry>
              <ClientLayout>{children}</ClientLayout>
            </StyledComponentsRegistry>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
