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

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 z-10 pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <Button
            size="large"
            className="bg-white !px-8 !h-auto !py-3 text-black border-gray-300 shadow-sm hover:!translate-y-[-2px] transition-transform font-medium"
            onClick={handleRegisterShopClick}
          >
            {t("registerShop")}
          </Button>
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

      <LoginModal
        visible={isLoginModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
