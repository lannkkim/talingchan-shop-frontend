"use client";

import Image from "next/image";
import { Link } from "@/navigation";

export default function MarketFooter() {
  return (
    <footer className="bg-black text-white">
      {/* Top section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Brand */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/icon/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="brightness-0 invert"
                />
                <span className="text-xl font-bold tracking-widest">TALINGCHAN</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                ตลาดซื้อ-ขาย-แลกเปลี่ยนการ์ดเกมออนไลน์ ครบวงจร
              </p>
              <div className="flex gap-3 mt-6">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs hover:border-white/60 cursor-pointer transition-colors">
                  F
                </div>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs hover:border-white/60 cursor-pointer transition-colors">
                  IG
                </div>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs hover:border-white/60 cursor-pointer transition-colors">
                  DC
                </div>
              </div>
            </div>

            {/* ตลาด */}
            <div className="md:col-span-2">
              <h4 className="text-xs tracking-widest uppercase font-semibold mb-4 text-gray-300">
                ตลาด
              </h4>
              <div className="space-y-3">
                <Link href="/market" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  ซื้อ-ขาย
                </Link>
                <Link href="/market/auction" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  ประมูล
                </Link>
                <Link href="/market/trade" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  แลกเปลี่ยน
                </Link>
                <Link href="/market/mystery-boxes" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  กล่องสุ่ม
                </Link>
              </div>
            </div>

            {/* บัญชี */}
            <div className="md:col-span-2">
              <h4 className="text-xs tracking-widest uppercase font-semibold mb-4 text-gray-300">
                บัญชี
              </h4>
              <div className="space-y-3">
                <Link href="/profile" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  โปรไฟล์
                </Link>
                <Link href="/shop" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  ร้านของฉัน
                </Link>
                <Link href="/stock" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  สต็อกการ์ด
                </Link>
                <Link href="/profile?tab=purchases" className="block text-sm text-gray-400 hover:text-white transition-colors">
                  ประวัติการสั่งซื้อ
                </Link>
              </div>
            </div>

            {/* ช่วยเหลือ */}
            <div className="md:col-span-2">
              <h4 className="text-xs tracking-widest uppercase font-semibold mb-4 text-gray-300">
                ช่วยเหลือ
              </h4>
              <div className="space-y-3">
                <span className="block text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                  วิธีการซื้อ
                </span>
                <span className="block text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                  วิธีการขาย
                </span>
                <span className="block text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                  ติดต่อเรา
                </span>
                <span className="block text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                  คำถามที่พบบ่อย
                </span>
              </div>
            </div>

            {/* นโยบาย */}
            <div className="md:col-span-2">
              <h4 className="text-xs tracking-widest uppercase font-semibold mb-4 text-gray-300">
                นโยบาย
              </h4>
              <div className="space-y-3">
                <span className="block text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                  นโยบายความเป็นส่วนตัว
                </span>
                <span className="block text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                  เงื่อนไขการใช้งาน
                </span>
                <span className="block text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                  นโยบายการคืนสินค้า
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container mx-auto max-w-7xl px-4 py-5 flex flex-col md:flex-row justify-between items-center gap-2">
        <span className="text-gray-500 text-xs">© 2026 TALINGCHAN. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-xs">🔒 ปลอดภัย 100%</span>
          <span className="text-gray-500 text-xs">💳 PromptPay</span>
        </div>
      </div>
    </footer>
  );
}
