"use client";

import CardSelector, {
  CardSelectorProps,
} from "@/components/shared/CardSelector";
import {
  COLORS,
  GEMS,
  POWER,
  PRINTS,
  RARITIES,
  SUBTYPES,
  SYMBOLS,
  TYPES,
} from "@/constants/filters";
import { CardFilters } from "@/services/card";
import { Card } from "@/types/card";
import {
  CheckOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Drawer,
  Input,
  Select,
  Typography,
} from "antd";
import { useState } from "react";

const { Title, Text } = Typography;
const { Search } = Input;

interface CardBrowserProps extends Omit<CardSelectorProps, "filters"> {
  // We omit 'filters' from props because CardBrowser manages them internally
  availableCards?: Card[] | null; // Optional filtered card list
}

export default function CardBrowser({
  selectable,
  onSelect,
  selectedCards,
  multiple,
  renderCustomActions,
  availableCards,
}: CardBrowserProps) {
  // activeFilters: Applied to the query
  const [activeFilters, setActiveFilters] = useState<CardFilters>({});
  // drawerFilters: Temporary state inside the drawer
  const [drawerFilters, setDrawerFilters] = useState<CardFilters>({});
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleDrawerFilterChange = (key: keyof CardFilters, value: any) => {
    setDrawerFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setActiveFilters((prev) => ({
      ...prev,
      ...drawerFilters,
      search: prev.search,
    }));
    setDrawerVisible(false);
  };

  const clearFilters = () => {
    setDrawerFilters({});
    setActiveFilters((prev) => ({ search: prev.search }));
  };

  const handleSearch = (value: string) => {
    setActiveFilters((prev) => ({ ...prev, search: value }));
  };

  const openDrawer = () => {
    setDrawerFilters({ ...activeFilters });
    setDrawerVisible(true);
  };

  const renderFilterContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto space-y-8 p-1">
        <div className="space-y-3">
          <Text strong className="uppercase tracking-widest text-xs block">
            Colors
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Colors"
            options={COLORS.map((c) => ({ label: c, value: c }))}
            value={drawerFilters.colors}
            onChange={(v) => handleDrawerFilterChange("colors", v)}
            allowClear
          />
        </div>

        <div className="space-y-3">
          <Text strong className="uppercase tracking-widest text-xs block">
            Card Types
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Types"
            options={TYPES.map((t) => ({ label: t, value: t }))}
            value={drawerFilters.types}
            onChange={(v) => handleDrawerFilterChange("types", v)}
            allowClear
          />
        </div>

        <div className="space-y-3">
          <Text strong className="uppercase tracking-widest text-xs block">
            Subtypes
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Subtypes"
            options={SUBTYPES.map((s) => ({ label: s, value: s }))}
            value={drawerFilters.subtypes}
            onChange={(v) => handleDrawerFilterChange("subtypes", v)}
            allowClear
          />
        </div>

        <div className="space-y-3">
          <Text strong className="uppercase tracking-widest text-xs block">
            Rarity
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Rarity"
            options={RARITIES.map((r) => ({ label: r, value: r }))}
            value={drawerFilters.rarities}
            onChange={(v) => handleDrawerFilterChange("rarities", v)}
            allowClear
          />
        </div>

        <div className="space-y-3">
          <Text strong className="uppercase tracking-widest text-xs block">
            Symbols
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Symbols"
            options={SYMBOLS.map((s) => ({ label: s, value: s }))}
            value={drawerFilters.symbols}
            onChange={(v) => handleDrawerFilterChange("symbols", v)}
            allowClear
          />
        </div>

        <div className="space-y-3">
          <Text strong className="uppercase tracking-widest text-xs block">
            Prints
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Prints"
            options={PRINTS.map((p) => ({ label: p, value: p }))}
            value={drawerFilters.prints}
            onChange={(v) => handleDrawerFilterChange("prints", v)}
            allowClear
          />
        </div>

        <div className="space-y-3">
          <Text strong className="uppercase tracking-widest text-xs block">
            Gems
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Gems"
            options={GEMS.map((g) => ({ label: g.toString(), value: g }))}
            value={drawerFilters.gems}
            onChange={(v) => handleDrawerFilterChange("gems", v)}
            allowClear
          />
        </div>

        <div className="space-y-3">
          <Text strong className="uppercase tracking-widest text-xs block">
            Power
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Power"
            options={POWER.map((p) => ({ label: p.toString(), value: p }))}
            value={drawerFilters.powers}
            onChange={(v) => handleDrawerFilterChange("powers", v)}
            allowClear
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex gap-0">
        <Button
          onClick={clearFilters}
          block
          icon={<ReloadOutlined />}
          className="uppercase tracking-wider rounded-none !h-12 border-black !text-black hover:!bg-gray-100"
        >
          Clear Filter
        </Button>
        <Button
          type="primary"
          onClick={applyFilters}
          block
          icon={<CheckOutlined />}
          className="uppercase tracking-wider rounded-none !h-12 !bg-black hover:!bg-gray-800"
        >
          Use Filter
        </Button>
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#000000",
          borderRadius: 0,
          fontFamily: "var(--font-inter)",
          colorText: "#000000",
          colorBgContainer: "#ffffff",
          colorBorder: "#e5e5e5",
        },
        components: {
          Button: {
            borderRadius: 0,
            controlHeight: 48,
          },
          Input: {
            borderRadius: 0,
            controlHeight: 48,
            activeBorderColor: "#000000",
            hoverBorderColor: "#000000",
          },
          Select: {
            borderRadius: 0,
            controlHeight: 48,
            colorPrimary: "#000000",
            controlItemBgActive: "#f5f5f5",
          },
        },
      }}
    >
      <div className="flex flex-col gap-0 border-b border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 ">
          <div className="flex items-center gap-0 w-full md:w-auto flex-1 border border-gray-200">
            <Button
              icon={<FilterOutlined />}
              onClick={openDrawer}
              size="large"
              type="text"
              className="!h-12 uppercase tracking-wider !rounded-none !border-r border-gray-200 !px-6 hover:bg-gray-50"
            >
              Filters
            </Button>
            <Search
              placeholder="SEARCH CARDS..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => {
                if (e.target.value === "") handleSearch("");
              }}
              className="w-full flex-1 !border-none [&_.ant-input]:!border-none [&_.ant-input-group-addon]:!hidden"
              size="large"
              variant="borderless"
            />
          </div>
        </div>

        <CardSelector
          selectable={selectable}
          onSelect={onSelect}
          selectedCards={selectedCards}
          multiple={multiple}
          renderCustomActions={renderCustomActions}
          filters={activeFilters}
          availableCards={availableCards}
        />

        <Drawer
          title={
            <span className="uppercase tracking-widest text-sm">Filters</span>
          }
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          size="default"
          closeIcon={null}
          extra={
            <Button
              type="text"
              onClick={() => setDrawerVisible(false)}
              className="uppercase tracking-widest"
            >
              Close
            </Button>
          }
        >
          {renderFilterContent()}
        </Drawer>
      </div>
    </ConfigProvider>
  );
}
