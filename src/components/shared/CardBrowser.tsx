"use client";

import React, { useState } from "react";
import { Button, Drawer, Select, Typography, Input, ConfigProvider, Space } from "antd";
import { FilterOutlined, ReloadOutlined, CheckOutlined } from "@ant-design/icons";
import { CardFilters } from "@/services/card";
import CardSelector, { CardSelectorProps } from "@/components/shared/CardSelector";
import { COLORS, TYPES, SUBTYPES, RARITIES, SYMBOLS, PRINTS, GEMS, POWER } from "@/constants/filters";
import { Card } from "@/types/card";

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
  availableCards
}: CardBrowserProps) {
  // activeFilters: Applied to the query
  const [activeFilters, setActiveFilters] = useState<CardFilters>({});
  // drawerFilters: Temporary state inside the drawer
  const [drawerFilters, setDrawerFilters] = useState<CardFilters>({});
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleDrawerFilterChange = (key: keyof CardFilters, value: any) => {
    setDrawerFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setActiveFilters(prev => ({
      ...prev,
      ...drawerFilters,
      search: prev.search 
    }));
    setDrawerVisible(false);
  };

  const clearFilters = () => {
    setDrawerFilters({});
    setActiveFilters(prev => ({ search: prev.search })); 
  };

  const handleSearch = (value: string) => {
    setActiveFilters(prev => ({ ...prev, search: value }));
  };

  const openDrawer = () => {
    setDrawerFilters({ ...activeFilters });
    setDrawerVisible(true);
  };

  const FilterContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 p-1">
        
        <div className="space-y-2">
          <Text strong>Colors</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Colors"
            options={COLORS.map(c => ({ label: c, value: c }))}
            value={drawerFilters.colors}
            onChange={(v) => handleDrawerFilterChange('colors', v)}
            allowClear
          />
        </div>

        <div className="space-y-2">
          <Text strong>Card Types</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Types"
            options={TYPES.map(t => ({ label: t, value: t }))}
            value={drawerFilters.types}
            onChange={(v) => handleDrawerFilterChange('types', v)}
            allowClear
          />
        </div>

        <div className="space-y-2">
          <Text strong>Subtypes</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Subtypes"
            options={SUBTYPES.map(s => ({ label: s, value: s }))}
            value={drawerFilters.subtypes}
            onChange={(v) => handleDrawerFilterChange('subtypes', v)}
            allowClear
          />
        </div>

        <div className="space-y-2">
          <Text strong>Rarity</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Rarity"
            options={RARITIES.map(r => ({ label: r, value: r }))}
            value={drawerFilters.rarities}
            onChange={(v) => handleDrawerFilterChange('rarities', v)}
            allowClear
          />
        </div>

        <div className="space-y-2">
          <Text strong>Symbols</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Symbols"
            options={SYMBOLS.map(s => ({ label: s, value: s }))}
            value={drawerFilters.symbols}
            onChange={(v) => handleDrawerFilterChange('symbols', v)}
            allowClear
          />
        </div>

        <div className="space-y-2">
          <Text strong>Prints</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Prints"
            options={PRINTS.map(p => ({ label: p, value: p }))}
            value={drawerFilters.prints}
            onChange={(v) => handleDrawerFilterChange('prints', v)}
            allowClear
          />
        </div>

        <div className="space-y-2">
          <Text strong>Gems</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Gems"
            options={GEMS.map(g => ({ label: g.toString(), value: g }))}
            value={drawerFilters.gems}
            onChange={(v) => handleDrawerFilterChange('gems', v)}
            allowClear
          />
        </div>

        <div className="space-y-2">
          <Text strong>Power</Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Power"
            options={POWER.map(p => ({ label: p.toString(), value: p }))}
            value={drawerFilters.powers}
            onChange={(v) => handleDrawerFilterChange('powers', v)}
            allowClear
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex gap-2">
        <Button onClick={clearFilters} block icon={<ReloadOutlined />}>
          Clear Filter
        </Button>
        <Button type="primary" onClick={applyFilters} block icon={<CheckOutlined />}>
          Use Filter
        </Button>
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
           <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              <Button 
                icon={<FilterOutlined />} 
                onClick={openDrawer}
                size="large"
              >
                Filters
              </Button>
              <Search 
                placeholder="Search cards..." 
                allowClear 
                onSearch={handleSearch}
                onChange={(e) => {
                   if (e.target.value === "") handleSearch("");
                }}
                className="w-full flex-1"
                size="large"
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
          title="Filters"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          size="default"
        >
          <FilterContent />
        </Drawer>
      </div>
    </ConfigProvider>
  );
}
