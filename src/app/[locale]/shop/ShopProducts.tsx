"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyProducts, updateProduct, deleteProduct } from "@/services/product";
import {
  Button,
  Tag,
  Empty,
  Card,
  Typography,
  Space,
  Modal,
  Row,
  Col,
  App,
  Tooltip
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  StopOutlined,
  ReloadOutlined,
  DeleteOutlined,
  MoreOutlined
} from "@ant-design/icons";
import { Link } from "@/navigation";
import Image from "next/image";
import { Product } from "@/types/product";
import { getCardImageUrl } from "@/utils/image";
import { RenewPriceModal } from "./RenewPriceModal";
import { useTranslations } from "next-intl";

const { Text, Title } = Typography;

export default function ShopProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renewProduct, setRenewProduct] = useState<Product | null>(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const { modal, message } = App.useApp();
  const t = useTranslations("Shop.products");

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ["myProducts"],
    queryFn: () => getMyProducts(),
  });

  // Filter only sell orders
  const sellProducts = products.filter(
    (p: Product) => p.transaction_type?.code === "sell",
  );

  const handleCloseSale = (product: Product) => {
    modal.confirm({
      title: t("modal.closeTitle"),
      content: t("modal.closeContent", { name: product.name }),
      okText: t("modal.closeOk"),
      cancelText: t("modal.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await updateProduct(product.product_id, { status: "inactive" });
          message.success(t("modal.success"));
          refetch();
        } catch (err: any) {
          message.error(err.message || t("modal.error"));
        }
      },
    });
  };

  const handleDelete = (product: Product) => {
    modal.confirm({
      title: "Delete Product",
      content: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      okText: "Yes, Delete",
      okType: 'danger',
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteProduct(product.product_id);
          message.success("Product deleted successfully");
          refetch();
        } catch (err: any) {
          message.error(err.message || "Failed to delete product");
        }
      }
    });
  };

  const handleRenewSuccess = () => {
    refetch();
    setIsRenewModalOpen(false);
    setRenewProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-1">
            {t("title")}
          </Title>
          <Text type="secondary">{t("description")}</Text>
        </div>
        <Link href="/shop/product/add">
          <Button type="primary" icon={<PlusOutlined />} size="large" className="px-6">
            {t("add")}
          </Button>
        </Link>
      </div>

      {sellProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sellProducts.map((product) => {
            const activePrice = product.price_period?.find((p) => p.status === "active") || product.price_period?.[0];
            const cardImage = product.product_stock_card?.[0]?.card?.image_name || product.product_stock_card?.[0]?.stock_card?.card?.image_name;
            const imageUrl = getCardImageUrl(cardImage);
            const isInactive = product.status !== 'active';

            return (
              <div key={product.product_id} className="group relative bg-white border border-gray-200 hover:border-black transition-all duration-200">
                {/* Status Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <Tag color={product.status === 'active' ? 'green' : 'orange'} className="mr-0 border-0 shadow-sm">
                    {product.status?.toUpperCase()}
                  </Tag>
                </div>

                {/* Image Area */}
                <div className="aspect-[3/4] relative bg-gray-50 overflow-hidden cursor-pointer" onClick={() => {
                  setSelectedProduct(product);
                  setIsModalOpen(true);
                }}>
                  {imageUrl ? (
                    <Image
                      src={getCardImageUrl(cardImage, "thumb")}
                      alt={product.name}
                      fill
                      className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isInactive ? 'grayscale' : ''}`}
                      sizes="(max-width: 768px) 100vw, 20vw"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <div className="text-center">
                        <StopOutlined className="text-2xl mb-2" />
                        <div className="text-xs">No Image</div>
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay with Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      shape="circle"
                      icon={<EyeOutlined />}
                      className="bg-white border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setIsModalOpen(true);
                      }}
                    />
                    {product.status === 'active' && (
                      <Tooltip title={t("actions.close")}>
                        <Button
                          shape="circle"
                          danger
                          icon={<StopOutlined />}
                          className="bg-white border-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseSale(product);
                          }}
                        />
                      </Tooltip>
                    )}
                    {(product.status === "expired" || product.status === "inactive") && (
                      <Tooltip title={t("actions.renew")}>
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<ReloadOutlined />}
                          className="border-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenewProduct(product);
                            setIsRenewModalOpen(true);
                          }}
                        />
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <Button
                        shape="circle"
                        danger
                        icon={<DeleteOutlined />}
                        className="bg-white border-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product);
                        }}
                      />
                    </Tooltip>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-3">
                  <div className="mb-1">
                    <Text strong className="block truncate text-sm" title={product.name}>{product.name}</Text>
                    <Text type="secondary" className="text-xs">{product.product_type?.name || "N/A"}</Text>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <div>
                      {activePrice ? (
                        <Text strong className="block text-base">฿{Number(activePrice.price).toLocaleString()}</Text>
                      ) : (
                        <Text type="secondary">-</Text>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      x{product.quantity || 1}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-20 border-dashed border-2">
          <Empty
            description={
              <Space orientation="vertical" size="large">
                <Text type="secondary" className="text-lg">{t("empty.description")}</Text>
                <Link href="/shop/product/add">
                  <Button type="primary" icon={<PlusOutlined />} size="large" className="px-8">
                    {t("add")}
                  </Button>
                </Link>
              </Space>
            }
          />
        </Card>
      )}

      {/* Product Detail Modal */}
      <Modal
        title={null}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
        destroyOnHidden
        centered
        className="product-detail-modal"
      >
        {selectedProduct && (
          <div className="p-4">
            <Row gutter={48}>
              {/* Left Column: Cards List as Visual Grid */}
              <Col span={10}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {selectedProduct.product_stock_card?.map((pc) => {
                    const card = pc.stock_card?.card || pc.card;
                    const cardImageUrl = getCardImageUrl(card?.image_name);
                    return (
                      <div key={pc.product_stock_card_id} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <Image
                          src={cardImageUrl}
                          alt={card?.name || "Card"}
                          fill
                          className="object-cover"
                          sizes="150px"
                          unoptimized
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                          {card?.name}
                        </div>
                        <div className="absolute top-1 right-1 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          x{pc.quantity}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <Text type="secondary" className="text-xs">
                    Includes {selectedProduct.product_stock_card?.reduce((sum, pc) => sum + pc.quantity, 0) || 0} cards
                  </Text>
                </div>
              </Col>

              {/* Right Column: Product Details */}
              <Col span={14}>
                <div className="h-full flex flex-col">
                  <div>
                    <Tag color="blue" className="mb-2">{selectedProduct.product_type?.name || "Product"}</Tag>
                    <Title level={3} className="!mt-0 !mb-2">{selectedProduct.name}</Title>
                    <Text className="text-2xl font-medium block mb-6">
                      ฿{Number(selectedProduct.price).toLocaleString()}
                    </Text>
                  </div>

                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 max-h-[600px]">
                    <div>
                      <Text strong className="block mb-2 text-xs uppercase tracking-wider text-gray-500">Description</Text>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedProduct.description || "No description provided."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                      <div>
                        <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-500">Status</Text>
                        <Tag color={selectedProduct.status === 'active' ? 'green' : 'orange'}>
                          {selectedProduct.status?.toUpperCase()}
                        </Tag>
                      </div>
                      <div>
                        <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-500">Stock Quantity</Text>
                        <Text className="text-base">{selectedProduct.quantity || 1} units</Text>
                      </div>
                      <div>
                        <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-500">Total Cards</Text>
                        <Text className="text-base">{selectedProduct.total_quantity || "-"}</Text>
                      </div>
                      <div>
                         <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-500">Shipping Fee</Text>
                         <Text className="text-base">
                           {selectedProduct.shipping_fee ? `฿${Number(selectedProduct.shipping_fee).toLocaleString()}` : "Free Shipping"}
                         </Text>
                      </div>
                      {selectedProduct.started_at && (
                        <div>
                          <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-500">Started At</Text>
                          <Text className="text-sm">{new Date(selectedProduct.started_at).toLocaleString()}</Text>
                        </div>
                      )}
                      {selectedProduct.ended_at && (
                        <div>
                          <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-500">Ended At</Text>
                          <Text className="text-sm">{new Date(selectedProduct.ended_at).toLocaleString()}</Text>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100 flex gap-3">
                    {selectedProduct.status === "active" && (
                      <Button
                        danger
                        size="large"
                        className="flex-1"
                        icon={<StopOutlined />}
                        onClick={() => {
                          setIsModalOpen(false);
                          handleCloseSale(selectedProduct);
                        }}
                      >
                        Close Sale
                      </Button>
                    )}
                    {(selectedProduct.status === "expired" || selectedProduct.status === "inactive") && (
                      <Button
                        type="primary"
                        size="large"
                        className="flex-1"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          setIsModalOpen(false);
                          setRenewProduct(selectedProduct);
                          setIsRenewModalOpen(true);
                        }}
                      >
                        Renew Sale
                      </Button>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      <RenewPriceModal
        product={renewProduct}
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        onSuccess={handleRenewSuccess}
      />
    </div>
  );
}
