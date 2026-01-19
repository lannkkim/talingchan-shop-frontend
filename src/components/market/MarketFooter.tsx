"use client";

import { Typography } from "antd";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

const { Title, Text } = Typography;

export default function MarketFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-gray-800 text-white py-8 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Title level={5} className="!text-white !mb-4">
              TALINGCHAN
            </Title>
            <Text className="text-gray-400">{t("description")}</Text>
          </div>
          <div>
            <Title level={5} className="!text-white !mb-4">
              {t("quickLinks")}
            </Title>
            <div className="flex flex-col gap-2">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {t("about")}
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {t("contact")}
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {t("faq")}
              </Link>
            </div>
          </div>
          <div>
            <Title level={5} className="!text-white !mb-4">
              {t("categories")}
            </Title>
            <div className="flex flex-col gap-2">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {t("cardGames")}
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {t("figures")}
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {t("accessories")}
              </Link>
            </div>
          </div>
          <div>
            <Title level={5} className="!text-white !mb-4">
              {t("followUs")}
            </Title>
            <Text className="text-gray-400">{t("stayConnected")}</Text>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <Text className="text-gray-500">{t("rights")}</Text>
        </div>
      </div>
    </footer>
  );
}
