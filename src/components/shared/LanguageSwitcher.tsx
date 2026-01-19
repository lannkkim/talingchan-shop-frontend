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

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const items = [
    {
      key: "en",
      label: "English",
      onClick: () => handleLocaleChange("en"),
    },
    {
      key: "th",
      label: "ไทย",
      onClick: () => handleLocaleChange("th"),
    },
  ];

  return (
    <Dropdown menu={{ items, selectedKeys: [locale] }} placement="bottomRight">
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="items-center flex"
      >
        {locale === "th" ? "TH" : "EN"}
      </Button>
    </Dropdown>
  );
}
