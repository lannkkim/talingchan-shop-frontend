"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  StopOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { formatDate, formatCurrency } from "@/utils/format";
import { Link } from "@/navigation";
import Image from "next/image";
import { Product, ProductStockCard } from "@/types/product";
import { getCardImageUrl } from "@/utils/image";
import { RenewPriceModal } from "./RenewPriceModal";
import { useTranslations } from "next-intl";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";

const { Text, Title } = Typography;

export default function ShopProducts() {
  const queryClient = useQueryClient();
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

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      updateProduct(id, { status }),
    onSuccess: () => {
      message.success(t("modal.success"));
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
    onError: (err: any) => {
      message.error(err.message || t("modal.error"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      message.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
    onError: (err: any) => {
      message.error(err.message || "Failed to delete product");
    }
  });

  const handleCloseSale = (product: Product) => {
    modal.confirm({
      title: t("modal.closeTitle"),
      content: t("modal.closeContent", { name: product.name }),
      okText: t("modal.closeOk"),
      cancelText: t("modal.cancel"),
      okButtonProps: { danger: true },
      onOk: () => updateStatusMutation.mutateAsync({ id: product.product_id, status: "inactive" }),
    });
  };

  const handleDelete = (product: Product) => {
    modal.confirm({
      title: "Delete Product",
      content: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      okText: "Yes, Delete",
      okType: 'danger',
      cancelText: "Cancel",
      onOk: () => deleteMutation.mutateAsync(product.product_id),
    });
  };

  const handleRenewSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    setIsRenewModalOpen(false);
    setRenewProduct(null);
  };

  return (
    <ManagementPageLayout
      title={t("title")}
      description={t("description")}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} />
          <Link href="/shop/product/add">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("add")}
            </Button>
          </Link>
        </Space>
      }
      noCardPadding
    >
      <div className="p-6">
        {sellProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sellProducts.map((product) => {
              const activePrice = product.price_period?.find((p) => p.status === "active") || product.price_period?.[0];
              const cardImage = product.product_stock_card?.[0]?.card?.image_name || product.product_stock_card?.[0]?.stock_card?.card?.image_name;
              const imageUrl = getCardImageUrl(cardImage);
              const isInactive = product.status !== 'active';

              return (
                <div key={product.product_id} className="group relative bg-white border border-gray-100 hover:border-blue-500 transition-all duration-200 rounded-lg overflow-hidden shadow-sm">
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
                          <Text strong className="block text-base text-blue-600">฿{Number(activePrice.price).toLocaleString()}</Text>
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
          <div className="text-center py-20">
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
          </div>
        )}
      </div>

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
                  {selectedProduct.product_stock_card?.map((pc: ProductStockCard) => {
                    const card = pc.stock_card?.card || pc.card;
                    const cardImageUrl = getCardImageUrl(card?.image_name);
                    return (
                      <div key={pc.product_stock_card_id} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
                        <Image
                          src={cardImageUrl}
                          alt={card?.name || "Card"}
                          fill
                          className="object-cover"
                          sizes="150px"
                          unoptimized
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-2 text-center truncate">
                          {card?.name}
                        </div>
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          x{pc.quantity}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <Text type="secondary" className="text-xs">
                    {t("modal.includesCards", { count: selectedProduct.product_stock_card?.reduce((sum, pc) => sum + pc.quantity, 0) || 0 })}
                  </Text>
                </div>
              </Col>

              {/* Right Column: Product Details */}
              <Col span={14}>
                <div className="h-full flex flex-col">
                  <div>
                    <Tag color="blue" className="mb-2">{selectedProduct.product_type?.name || "Product"}</Tag>
                    <Title level={3} className="!mt-0 !mb-2">{selectedProduct.name}</Title>
                    <Text className="text-2xl font-bold block mb-6 text-blue-600">
                      {formatCurrency(selectedProduct.price_period?.find((p: any) => p.status === "active")?.price || selectedProduct.price)}
                    </Text>
                  </div>

                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 max-h-[600px]">
                    <div>
                      <Text strong className="block mb-2 text-xs uppercase tracking-wider text-gray-400">{t("modal.description")}</Text>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedProduct.description || "No description provided."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                      <div>
                        <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-400">{t("columns.status")}</Text>
                        <Tag color={selectedProduct.status === 'active' ? 'green' : 'orange'}>
                          {selectedProduct.status?.toUpperCase()}
                        </Tag>
                      </div>
                      <div>
                        <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-400">{t("columns.quantity")}</Text>
                        <Text className="text-base font-medium">{selectedProduct.quantity || 1} units</Text>
                      </div>
                      <div>
                        <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-400">{t("modal.totalCards") || "Total Cards"}</Text>
                        <Text className="text-base font-medium">{selectedProduct.total_quantity || "-"}</Text>
                      </div>
                      <div>
                         <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-400">{t("modal.shippingFee") || "Shipping Fee"}</Text>
                         <Text className="text-base font-medium text-green-600">
                           {selectedProduct.shipping_fee ? formatCurrency(selectedProduct.shipping_fee) : "Free Shipping"}
                         </Text>
                      </div>
                      {selectedProduct.started_at && (
                        <div>
                          <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-400">{t("modal.startedAt") || "Started At"}</Text>
                          <Text className="text-sm">{formatDate(selectedProduct.started_at, true)}</Text>
                        </div>
                      )}
                      {selectedProduct.ended_at && (
                        <div>
                          <Text strong className="block mb-1 text-xs uppercase tracking-wider text-gray-400">{t("modal.endedAt") || "Ended At"}</Text>
                          <Text className="text-sm">{formatDate(selectedProduct.ended_at, true)}</Text>
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
                        {t("actions.close")}
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
                        {t("actions.renew")}
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
    </ManagementPageLayout>
  );
}
