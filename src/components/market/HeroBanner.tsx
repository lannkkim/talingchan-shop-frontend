"use client";

import { Typography, Tag } from "antd";

const { Title } = Typography;

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[300px] lg:h-[400px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <Title level={1} className="!text-4xl lg:!text-6xl !mb-2 font-bold">
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                ตาลิ่ง-shirt
              </span>{" "}
              <span className="text-gray-700">collection</span>
            </Title>
            <Tag color="orange" className="text-lg px-4 py-1">
              Vol.2
            </Tag>
          </div>
        </div>
      </div>
    </div>
  );
}
