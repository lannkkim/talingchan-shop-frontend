"use client";

import { Typography, Tag, Button } from "antd";
import Image from "next/image";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

const { Title } = Typography;

export default function HeroBanner() {
  const t = useTranslations("Hero");

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
          <Link href="/shop">
            <Button
              size="large"
              className="bg-white !px-8 !h-auto !py-3 text-black border-gray-300 shadow-sm hover:!translate-y-[-2px] transition-transform font-medium"
            >
              {t("registerShop")}
            </Button>
          </Link>
          <Button
            size="large"
            className="bg-white !px-8 !h-auto !py-3 text-black border-gray-300 shadow-sm hover:!translate-y-[-2px] transition-transform font-medium"
          >
            {t("buyProducts")}
          </Button>
          <Button
            size="large"
            className="bg-white !px-8 !h-auto !py-3 text-black border-gray-300 shadow-sm hover:!translate-y-[-2px] transition-transform font-medium"
          >
            {t("exchange")}
          </Button>
        </div>
      </div>
    </div>
  );
}
