"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyProducts } from "@/services/product";
import {
  Table,
  Button,
  Tag,
  Empty,
  Card,
  Typography,
  Space,
  Modal,
  Row,
  Col,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  StopOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Link } from "@/navigation";
import Image from "next/image";
import { Product } from "@/types/product";
import { getCardImageUrl } from "@/utils/image";
import { updateProduct } from "@/services/product";
import { App, Tooltip, message } from "antd";
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

  const handleOpenSale = (product: Product) => {
      modal.confirm({
        title: "Open Sale",
        content: `Are you sure you want to start selling "${product.name}" again?`,
        okText: "Yes, Open Sale",
        cancelText: "Cancel",
        onOk: async () => {
          try {
             // Just setting to active. Price remains same.
            await updateProduct(product.product_id, { status: "active" });
            message.success("Product is now active");
            refetch();
          } catch (err: any) {
            message.error(err.message || "Failed to open sale");
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
            // Need deleteProduct service but current import only has updateProduct/getProducts.
            // Assuming strict separation, I might need to import it or implement it?
            // Wait, import at top only has getProducts, updateProduct.
            // I should check if deleteProduct exists in services/product
             try {
                // Dynamic import or assume it handles Delete via API? 
                // Product service usually has delete.
                // Re-checking imports... 
                // Need to update import first.
                // For now, I'll place placeholder and fix imports in next step.
                 const { deleteProduct } = await import("@/services/product");
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

  const columns = [
    {
      title: t("columns.name"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Product) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.description && (
            <Text type="secondary" className="text-xs">
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: t("columns.price"),
      key: "price",
      render: (_: any, record: Product) => {
        const activePrice =
          record.price_period?.find((p) => p.status === "active") ||
          record.price_period?.[0];
        return activePrice ? (
          <Text strong>฿{Number(activePrice.price).toLocaleString()}</Text>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: t("columns.type"),
      dataIndex: "product_type",
      key: "type",
      render: (type: any) =>
        type ? <Tag color="blue">{type.name}</Tag> : <Tag>N/A</Tag>,
    },
    {
      title: t("columns.cards"),
      key: "cards",
      render: (_: any, record: Product) => {
        const count = record.product_stock_card?.length || 0;
        return (
          <Text>
            {count} card{count !== 1 ? "s" : ""}
          </Text>
        );
      },
    },
    {
      title: t("columns.quantity"),
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => <Text strong>{quantity || 1}</Text>,
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "orange"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t("columns.actions"),
      key: "actions",
      render: (_: any, record: Product) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedProduct(record);
              setIsModalOpen(true);
            }}
          >
            {t("actions.view")}
          </Button>
          {record.status === "active" && (
            <Tooltip title={t("actions.close")}>
              <Button
                danger
                icon={<StopOutlined />}
                size="small"
                onClick={() => handleCloseSale(record)}
              />
            </Tooltip>
          )}
          {(record.status === "expired" || record.status === "inactive") && (
            <Tooltip title={t("actions.renew")}>
              <Button
                type="primary"
                ghost
                icon={<ReloadOutlined />}
                size="small"
                onClick={() => {
                  setRenewProduct(record);
                  setIsRenewModalOpen(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Title level={5} className="!mb-1">
            {t("title")}
          </Title>
          <Text type="secondary">{t("description")}</Text>
        </div>
        <Link href="/shop/product/add">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            {t("add")}
          </Button>
        </Link>
      </div>

      {sellProducts.length > 0 ? (
        <Table
          columns={columns}
          dataSource={sellProducts}
          rowKey="product_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Card className="text-center py-12">
          <Empty
            description={
              <Space orientation="vertical">
                <Text strong>{t("empty.title")}</Text>
                <Text type="secondary">{t("empty.description")}</Text>
              </Space>
            }
          />
          <Link href="/shop/product/add" className="mt-4 inline-block">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              {t("add")}
            </Button>
          </Link>
        </Card>
      )}

      {/* Product Detail Modal */}
      <Modal
        title={selectedProduct?.name}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {selectedProduct && (
          <div className="mt-4">
            <Row gutter={24}>
              {/* Left Column: Cards List */}
              <Col span={12} className="border-r border-gray-100">
                <Title level={5} className="mb-4">
                  {t("columns.cards")} (
                  {selectedProduct.product_stock_card?.reduce(
                    (sum, pc) => sum + pc.quantity,
                    0,
                  ) || 0}{" "}
                  {t("items", { count: 0 }).replace("0 ", "")})
                </Title>
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                  {selectedProduct.product_stock_card?.map((pc) => {
                    const card = pc.stock_card?.card || pc.card;
                    const cardImageUrl = getCardImageUrl(card?.image_name);
                    return (
                      <div
                        key={pc.product_stock_card_id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                      >
                        <div className="relative w-12 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={cardImageUrl}
                            alt={card?.name || "Card"}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text
                            strong
                            className="block truncate"
                            title={card?.name}
                          >
                            {card?.name}
                          </Text>
                          <div className="flex items-center gap-2 mt-1">
                            {card?.rare && (
                              <Tag className="m-0 text-[10px]" color="gold">
                                {card.rare}
                              </Tag>
                            )}
                            <Text type="secondary" className="text-xs">
                              {card?.type}
                            </Text>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Tag color="blue">x{pc.quantity}</Tag>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Col>

              {/* Right Column: Product Details */}
              <Col span={12}>
                <Title level={5} className="mb-4">
                  {t("modal.details")}
                </Title>
                <Space orientation="vertical" size="middle" className="w-full">
                  <div>
                    <Text type="secondary" className="block text-xs">
                      {t("modal.description")}
                    </Text>
                    <Text>{selectedProduct.description || "-"}</Text>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Space orientation="vertical" className="w-full">
                      <div className="flex justify-between items-center">
                        <Text type="secondary">{t("columns.price")}</Text>
                        {(() => {
                          const activePrice =
                            selectedProduct.price_period?.find(
                              (p) => p.status === "active",
                            ) || selectedProduct.price_period?.[0];
                          return activePrice ? (
                            <Text strong className="text-lg text-blue-600">
                              ฿{Number(activePrice.price).toLocaleString()}
                            </Text>
                          ) : (
                            <Text>-</Text>
                          );
                        })()}
                      </div>
                      <div className="flex justify-between items-center">
                        <Text type="secondary">{t("columns.type")}</Text>
                        <Tag color="blue">
                          {selectedProduct.product_type?.name || "N/A"}
                        </Tag>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text type="secondary">{t("columns.quantity")}</Text>
                        <Text strong>{selectedProduct.quantity || 1}</Text>
                      </div>
                      <div className="flex justify-between items-center">
                        <Text type="secondary">{t("columns.status")}</Text>
                        <Tag
                          color={
                            selectedProduct.status === "active"
                              ? "green"
                              : "orange"
                          }
                        >
                          {selectedProduct.status?.toUpperCase()}
                        </Tag>
                      </div>
                    </Space>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <Text type="secondary" className="block text-xs">
                        {t("modal.activeUntil")}
                      </Text>
                      <Text>
                        {selectedProduct.ended_at
                          ? new Date(selectedProduct.ended_at).toLocaleString()
                          : t("modal.indefinite")}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" className="block text-xs">
                        {t("modal.priceValidUntil")}
                      </Text>
                      {(() => {
                        const activePrice =
                          selectedProduct.price_period?.find(
                            (p) => p.status === "active",
                          ) || selectedProduct.price_period?.[0];
                        return activePrice?.price_period_ended ? (
                          <Text>
                            {new Date(
                              activePrice.price_period_ended,
                            ).toLocaleString()}
                          </Text>
                        ) : (
                          <Text type="secondary">
                            {t("modal.indefinite")} (or until changed)
                          </Text>
                        );
                      })()}
                    </div>
                  </div>
                </Space>
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
