"use client";

import React, { useMemo, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getProducts, ProductFilter } from "@/services/product";
import { Product } from "@/types/product";
import ProductItem from "@/components/shared/ProductItem";
import { Row, Col, Skeleton, Empty, Spin, Space, Typography, Checkbox, Radio } from "antd";

const { Text } = Typography;

const LIMIT = 20;

export interface ProductSelectorProps {
  onSelect?: (products: Product[]) => void;
  selectedProducts?: Product[];
  multiple?: boolean;
  selectable?: boolean;
  renderCustomActions?: (product: Product, isSelected: boolean) => React.ReactNode;
  filters?: ProductFilter;
  availableProducts?: Product[]; // If provided, use this instead of fetching (e.g. for searching in memory if list is small)
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  onSelect,
  selectedProducts = [],
  multiple = false,
  selectable = true,
  renderCustomActions,
  filters,
  availableProducts,
}) => {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", filters],
    queryFn: ({ pageParam = 1 }) => getProducts({ ...filters, limit: LIMIT }), // Pagination support depends on backend, assuming implicit or standard API
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Crude pagination check: if last page has LIMIT items, try next page.
      // Ideally backend returns total or cursor.
      return lastPage.length === LIMIT ? allPages.length + 1 : undefined;
    },
    enabled: !availableProducts,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = useMemo(() => {
    if (availableProducts) {
        // Simple search if provided
        // Note: ProductFilter doesn't strictly have 'search' on backend type yet, but we can filter here if availableProducts is used
        return availableProducts;
    }
    return data?.pages.flat() || [];
  }, [data, availableProducts]);

  const handleToggleSelect = (product: Product) => {
    if (!selectable || !onSelect) return;
    
    if (multiple) {
      const isSelected = selectedProducts.find((p) => p.product_id === product.product_id);
      if (isSelected) {
        onSelect(selectedProducts.filter((p) => p.product_id !== product.product_id));
      } else {
        onSelect([...selectedProducts, product]);
      }
    } else {
      onSelect([product]);
    }
  };

  if (isLoading && !availableProducts) {
    return (
      <Row gutter={[16, 24]}>
        {[...Array(6)].map((_, index) => (
          <Col key={index} xs={12} sm={8} md={6}>
            <Skeleton.Image className="!w-full !h-48 mb-2" active />
            <Skeleton active paragraph={{ rows: 1 }} />
          </Col>
        ))}
      </Row>
    );
  }

  if (isError && !availableProducts) {
    return <Empty description="Failed to load products" />;
  }

  return (
    <div className="space-y-6">
      <Row gutter={[16, 24]}>
        {allProducts.map((product, index) => {
          const isSelected = !!selectedProducts.find((p) => p.product_id === product.product_id);
          return (
            <Col key={`${product.product_id}-${index}`} xs={12} sm={8} md={6}>
              <div 
                className={`relative transition-all duration-200 rounded-xl overflow-hidden group ${
                  selectable ? "cursor-pointer" : ""
                } ${
                  selectable && isSelected
                    ? "ring-4 ring-blue-500 ring-offset-2 scale-[1.02]" 
                    : "hover:scale-[1.01]"
                }`}
                onClick={() => handleToggleSelect(product)}
              >
                <ProductItem product={product} />
                {selectable && (
                  <div className="absolute top-2 right-2 z-10 transition-transform duration-200">
                    {multiple ? (
                      <Checkbox checked={isSelected} className="scale-125" />
                    ) : (
                      <Radio checked={isSelected} className="scale-125" />
                    )}
                  </div>
                )}
                {renderCustomActions && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderCustomActions(product, isSelected)}
                  </div>
                )}
              </div>
            </Col>
          );
        })}
      </Row>

      <div ref={ref} className="py-8 flex justify-center w-full min-h-[50px]">
        {!availableProducts && isFetchingNextPage ? (
          <Space className="w-full justify-center">
            <Spin />
            <Text type="secondary">Loading more...</Text>
          </Space>
        ) : !availableProducts && hasNextPage ? (
            <Text type="secondary">Scroll for more</Text>
        ) : allProducts.length > 0 ? (
          <Text type="secondary" italic>{availableProducts ? "" : "No more products"}</Text>
        ) : (
          <Empty description="No products found" />
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
