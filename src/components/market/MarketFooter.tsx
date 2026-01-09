"use client";

import { Typography } from "antd";
import Link from "next/link";

const { Title, Text } = Typography;

export default function MarketFooter() {
  return (
    <footer className="bg-gray-800 text-white py-8 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Title level={5} className="!text-white !mb-4">
              TALINGCHAN
            </Title>
            <Text className="text-gray-400">
              Your destination for premium card games and collectibles.
            </Text>
          </div>
          <div>
            <Title level={5} className="!text-white !mb-4">
              Quick Links
            </Title>
            <div className="flex flex-col gap-2">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                About Us
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
          <div>
            <Title level={5} className="!text-white !mb-4">
              Categories
            </Title>
            <div className="flex flex-col gap-2">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Card Games
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Figures
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Accessories
              </Link>
            </div>
          </div>
          <div>
            <Title level={5} className="!text-white !mb-4">
              Follow Us
            </Title>
            <Text className="text-gray-400">
              Stay connected on social media
            </Text>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <Text className="text-gray-500">
            © 2026 Talingchan Shop. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  );
}
