"use client";

import { useRouter } from "@/navigation";
import { usePathname } from "next/navigation";

interface SubNavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

interface SubNavigationProps {
  items: SubNavigationItem[];
  logo?: React.ReactNode;
  className?: string;
}

export default function SubNavigation({
  items,
  logo,
  className = "",
}: SubNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={`bg-white shadow-sm sticky top-0 z-10 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
        {logo && <div className="flex items-center gap-4">{logo}</div>}
        
        <nav className="flex gap-6 text-sm text-gray-600">
          {items.map((item, index) => {
            const isActive = item.active !== undefined 
              ? item.active 
              : pathname === item.href;
            
            return (
              <span
                key={index}
                onClick={() => router.push(item.href)}
                className={`cursor-pointer hover:text-black transition-colors ${
                  isActive ? "font-medium text-black" : ""
                }`}
              >
                {item.label}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
