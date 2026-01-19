"use client";
import React from "react";
import { Dropdown, Button } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "th" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const items = [
    {
      key: "en",
      icon: <span className="text-sm font-medium">EN</span>,
      label: "English",
      onClick: () => handleLocaleChange("en"),
    },
    {
      key: "th",
      icon: <span className="text-sm font-medium">TH</span>,
      label: "ไทย",
      onClick: () => handleLocaleChange("th"),
    },
  ];

  return (
    <Dropdown menu={{ items, selectedKeys: [locale] }} placement="bottomRight">
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="flex items-center"
        onClick={toggleLocale}
      />
    </Dropdown>
  );
}
