"use client";

import { Typography, Tag } from "antd";
import Image from "next/image";

const { Title } = Typography;

export default function HeroBanner() {
  return (
    <div className="relative w-full h-[300px] lg:h-[400px] overflow-hidden">
      <Image
        src="/images/banner.png"
        alt="Banner"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
