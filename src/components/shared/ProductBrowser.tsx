"use client";

import React, { useState } from "react";
import { Button, Input, ConfigProvider, Radio } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ProductSelector, { ProductSelectorProps } from "@/components/shared/ProductSelector";
import { Product } from "@/types/product";
import { ProductFilter } from "@/services/product";

const { Search } = Input;

interface ProductBrowserProps extends Omit<ProductSelectorProps, "filters"> {
  availableProducts?: Product[];
}

export default function ProductBrowser({ 
  selectable, 
  onSelect, 
  selectedProducts, 
  multiple,
  renderCustomActions,
  availableProducts
}: ProductBrowserProps) {
  const [activeFilters, setActiveFilters] = useState<ProductFilter>({
      status: "active", // Default to filtering active products
      limit: 20
      // Note: Backend might not support 'search' string in filter yet, 
      // but we can pass it if we update backend or if using availableProducts
  });

  const handleSearch = (value: string) => {
      // Assuming backend *might* not strictly filter by name in 'ProductFilter' struct today depending on implementation,
      // but usually 'search' or similar param is desired. 
      // For now, if "getProducts" doesn't search, we might rely on listing recent active products.
      // But let's assume we want to pass some sort of filter.
      // Since 'ProductFilter' strict typing in frontend doesn't show 'search', we might be limited.
      // We will leave search no-op for query key for now unless we update type, OR we can cast if we know backend handles extra query params transparently (axios usually does).
      
      // Let's defer valid search integration until backend confirms support for ?search=...
      // For now, just trigger refetch or simple state update.
      console.log("Search not fully integrated with backend filter yet:", value);
  };

  const handleTypeChange = (e: any) => {
    const value = e.target.value;
    setActiveFilters(prev => ({
      ...prev,
      product_type_flag_code: value === 'all' ? undefined : value
    }));
  };

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
              <Search 
                placeholder="Search products..." 
                allowClear 
                onSearch={handleSearch}
                className="w-full flex-1"
                size="large"
                disabled // Disabled until backend search is confirmed/implemented
              />
           </div>
           
           <div className="flex items-center gap-2">
             <span className="text-gray-500 font-medium">Content Type:</span>
             <Radio.Group 
               defaultValue="all" 
               buttonStyle="solid"
               onChange={handleTypeChange}
             >
               <Radio.Button value="all">All</Radio.Button>
               <Radio.Button value="card">Card</Radio.Button>
               <Radio.Button value="merch">Merch</Radio.Button>
             </Radio.Group>
           </div>
        </div>

        <ProductSelector 
          selectable={selectable} 
          onSelect={onSelect}
          selectedProducts={selectedProducts}
          multiple={multiple}
          renderCustomActions={renderCustomActions}
          filters={activeFilters}
          availableProducts={availableProducts}
        />
      </div>
    </ConfigProvider>
  );
}
