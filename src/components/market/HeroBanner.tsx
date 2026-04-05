"use client";

import { Typography, Tag, Button } from "antd";
import Image from "next/image";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoginModal from "@/components/auth/LoginModal";

const { Title } = Typography;

export default function HeroBanner() {
  const t = useTranslations("Hero");
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const handleRegisterShopClick = () => {
    if (isAuthenticated) {
      router.push("/shop");
    } else {
      setShouldRedirect(true);
      setIsLoginModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
    // If user successfully logged in, redirect to shop
    if (shouldRedirect && isAuthenticated) {
      router.push("/shop");
      setShouldRedirect(false);
    }
  };

  // Watch for authentication changes while modal is open
  useEffect(() => {
    if (shouldRedirect && isAuthenticated && isLoginModalOpen) {
      setIsLoginModalOpen(false);
      router.push("/shop");
      setShouldRedirect(false);
    }
  }, [isAuthenticated, shouldRedirect, isLoginModalOpen, router]);

  return (
    <div className="relative w-full h-[500px] lg:h-[700px] overflow-hidden">
      <Image
        src="/images/banner.png"
        alt="Banner"
        fill
        className="object-cover"
        priority
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 z-20">
        <p className="text-white/80 text-sm tracking-widest uppercase mb-3 font-light">
          ตลาดการ์ดเกม
        </p>
        <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-2 text-center drop-shadow-lg">
          TALINGCHAN
        </h1>
        <p className="text-white/70 text-base mb-10 tracking-wide text-center">
          ซื้อ · ขาย · แลกเปลี่ยน · ประมูล
        </p>
        <div className="flex gap-3 flex-wrap justify-center pointer-events-auto">
          <Button
            size="large"
            type="primary"
            className="!bg-white !text-black !border-0 !font-semibold !px-8 hover:!bg-gray-100 !rounded-none !h-12"
            onClick={handleRegisterShopClick}
          >
            {t("registerShop")}
          </Button>
          <Button
            size="large"
            className="!bg-transparent !text-white !border-white !border !font-semibold !px-8 hover:!bg-white/10 !rounded-none !h-12"
          >
            <Link href="/market" className="text-white">
              {t("buyProducts")}
            </Link>
          </Button>
          <Button
            size="large"
            className="!bg-transparent !text-white !border-white/40 !border !font-semibold !px-8 hover:!bg-white/10 !rounded-none !h-12"
          >
            <Link href="/market/trade" className="text-white">
              {t("exchange")}
            </Link>
          </Button>
        </div>
      </div>

      <LoginModal
        visible={isLoginModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
