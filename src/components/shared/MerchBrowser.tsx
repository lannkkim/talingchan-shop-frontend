"use client";

import React, { useState } from "react";
import { Button, Input, ConfigProvider, Card, Avatar } from "antd";
import { SearchOutlined, CheckOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getMerch, Merch } from "@/services/merch";
import { getCardImageUrl } from "@/utils/image";

const { Search } = Input;
const { Meta } = Card;

interface MerchBrowserProps {
  onSelect: (merch: Merch[]) => void;
  selectedMerch: Merch[];
  multiple?: boolean;
  renderCustomActions?: (merch: Merch, isSelected: boolean) => React.ReactNode;
}

export default function MerchBrowser({
  onSelect,
  selectedMerch,
  multiple,
  renderCustomActions,
}: MerchBrowserProps) {
  const [search, setSearch] = useState<string>("");

  const { data: merchList = [], isLoading } = useQuery({
    queryKey: ["merch", search],
    queryFn: () => getMerch({ search }),
  });

  const handleSelect = (merch: Merch) => {
    if (multiple) {
      if (selectedMerch.find((m) => m.merch_id === merch.merch_id)) {
        onSelect(selectedMerch.filter((m) => m.merch_id !== merch.merch_id));
      } else {
        onSelect([...selectedMerch, merch]);
      }
    } else {
      onSelect([merch]);
    }
  };

  const isSelected = (merch: Merch) => {
    return !!selectedMerch.find((m) => m.merch_id === merch.merch_id);
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
        <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <Search
            placeholder="Search merch..."
            allowClear
            onSearch={setSearch}
            onChange={(e) => {
                if (e.target.value === "") setSearch("");
            }}
            className="w-full"
            size="large"
          />
        </div>

        {isLoading ? (
             <div className="flex justify-center p-8">
                 <Button loading type="text">Loading...</Button>
             </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {merchList.map((item) => {
                    const selected = isSelected(item);
                    return (
                        <div 
                            key={item.merch_id}
                            className={`relative cursor-pointer transition-all duration-300 transform ${
                                selected ? 'ring-2 ring-blue-500 scale-95 rounded-lg' : 'hover:-translate-y-1 hover:shadow-md'
                            }`}
                            onClick={() => handleSelect(item)}
                        >
                            <Card
                                hoverable
                                cover={
                                    <div className="aspect-[3/4] overflow-hidden relative">
                                        <img
                                            alt={item.name}
                                            src={getCardImageUrl(item.image_name || "default_card_back")}
                                            className="w-full h-full object-cover"
                                        />
                                        {selected && (
                                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center backdrop-blur-sm">
                                                <div className="bg-white rounded-full p-2 shadow-lg animate-in zoom-in duration-200">
                                                    <CheckOutlined className="text-xl text-blue-500" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                }
                                styles={{ body: { padding: "12px" } }}
                                className={selected ? "border-blue-500" : ""}
                            >
                                <Meta 
                                    title={<div className="text-sm text-center truncate">{item.name}</div>} 
                                />
                                 {renderCustomActions && (
                                    <div 
                                        onClick={(e) => e.stopPropagation()} 
                                        className="cursor-default"
                                    >
                                        {renderCustomActions(item, selected)}
                                    </div>
                                 )}
                            </Card>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </ConfigProvider>
  );
}
