"use client";

import { Typography, Tag, Button } from "antd";
import Image from "next/image";

const { Title } = Typography;

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[500px] lg:h-[700px] overflow-hidden">
      <Image
        src="/images/banner.png"
        alt="Banner"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 z-10 pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <Button
            size="large"
            className="bg-white !px-8 !h-auto !py-3 text-black border-gray-300 shadow-sm hover:!translate-y-[-2px] transition-transform font-medium"
          >
            สมัครร้านค้า
          </Button>
          <Button
            size="large"
            className="bg-white !px-8 !h-auto !py-3 text-black border-gray-300 shadow-sm hover:!translate-y-[-2px] transition-transform font-medium"
          >
            ซื้อสินค้า
          </Button>
          <Button
            size="large"
            className="bg-white !px-8 !h-auto !py-3 text-black border-gray-300 shadow-sm hover:!translate-y-[-2px] transition-transform font-medium"
          >
            แลก-เปลี่ยน
          </Button>
        </div>
      </div>
    </div>
  );
}
