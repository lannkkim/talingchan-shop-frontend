"use client";

import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function CategoryGridSection() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 hover:shadow-lg transition-shadow">
          <Title level={5} className="!text-blue-800">
            Featured Cards
          </Title>
          <Text className="text-blue-600">Explore our best selling cards</Text>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 hover:shadow-lg transition-shadow">
          <Title level={5} className="!text-purple-800">
            New Arrivals
          </Title>
          <Text className="text-purple-600">
            Check out the latest additions
          </Text>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 hover:shadow-lg transition-shadow">
          <Title level={5} className="!text-orange-800">
            Special Offers
          </Title>
          <Text className="text-orange-600">Limited time deals</Text>
        </Card>
      </div>
    </div>
  );
}
