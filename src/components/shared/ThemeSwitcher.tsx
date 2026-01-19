"use client";

import React from "react";
import { Button, Dropdown } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeSwitcher() {
  const { themeMode, toggleTheme, setThemeMode } = useTheme();

  const items = [
    {
      key: "light",
      icon: <SunOutlined />,
      label: "Light",
      onClick: () => setThemeMode("light"),
    },
    {
      key: "dark",
      icon: <MoonOutlined />,
      label: "Dark",
      onClick: () => setThemeMode("dark"),
    },
  ];

  return (
    <Dropdown
      menu={{ items, selectedKeys: [themeMode] }}
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={themeMode === "dark" ? <MoonOutlined /> : <SunOutlined />}
        className="flex items-center"
        onClick={toggleTheme}
      />
    </Dropdown>
  );
}
