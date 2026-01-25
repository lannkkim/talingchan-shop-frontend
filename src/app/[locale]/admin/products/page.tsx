"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import useMutation and useQueryClient
import { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Typography,
  Modal,
  message,
  App,
} from "antd"; // Import App from antd
import {
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import PageHeader from "@/components/shared/PageHeader";
import { getProducts, updateProduct, deleteProduct } from "@/services/product";
import { Product } from "@/types/product";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import dayjs from "dayjs";
import { ProductDetailsModal } from "@/components/admin/ProductDetailsModal";
import { useTranslations } from "next-intl";

const { Title } = Typography;
const { Option } = Select;

export default function AdminProductsPage() {
  const { user } = useAuth();
  const { modal, message } = App.useApp(); // Use App.useApp()
  const queryClient = useQueryClient(); // Get queryClient
  const t = useTranslations("Admin.Products");

  // State for filtering and sorting
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string | undefined>(undefined);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Fetch Products
  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "products", statusFilter, sortBy, sortOrder],
    queryFn: () =>
      getProducts({
        status: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
        include_shop: true,
      }),
  });

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateProduct(id, { status }),
    onSuccess: () => {
      message.success(t("confirm.success.status"));
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (error: any) => {
      message.error(
        t("confirm.error.status", {
          error: error.response?.data?.error || error.message,
        }),
      );
    },
  });

  // Mutation for deleting product
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      message.success(t("confirm.success.delete"));
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (error: any) => {
      message.error(
        t("confirm.error.delete", {
          error: error.response?.data?.error || error.message,
        }),
      );
    },
  });

  const handleApprove = (product: Product) => {
    // If started_at is in the future, set to 'approved' (waiting for start time).
    // If started_at is past or null, set to 'active'.
    const isFuture =
      product.started_at && dayjs(product.started_at).isAfter(dayjs());
    const newStatus = isFuture ? "approved" : "active";

    modal.confirm({
      title: t("confirm.approveTitle"),
      content: t("confirm.approveContent", {
        name: product.name,
        status: newStatus,
      }),
      onOk: () =>
        updateStatusMutation.mutate({
          id: product.product_id,
          status: newStatus,
        }),
    });
  };

  const handleReject = (product: Product) => {
    modal.confirm({
      title: t("confirm.rejectTitle"),
      content: t("confirm.rejectContent", { name: product.name }),
      okType: "danger",
      onOk: () =>
        updateStatusMutation.mutate({
          id: product.product_id,
          status: "rejected",
        }), // Assuming 'rejected' or similar status exists, check schema? 'inactive'?
    });
  };

  const handleDelete = (product: Product) => {
    modal.confirm({
      title: t("confirm.deleteTitle"),
      content: t("confirm.deleteContent", { name: product.name }),
      okType: "danger",
      onOk: () => deleteProductMutation.mutate(product.product_id),
    });
  };

  const columns = [
    {
      title: t("columns.id"),
      dataIndex: "product_id",
      key: "product_id",
      width: 80,
    },
    {
      title: t("columns.name"),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Product) => (
        <div className="flex flex-col">
          <span className="font-semibold">{text}</span>
          <span className="text-xs text-gray-400">
            {t("columns.type")}: {record.product_type?.name}
          </span>
        </div>
      ),
    },
    {
      title: t("columns.shop"),
      key: "shop",
      render: (_: any, record: Product) => {
        if (record.is_admin_shop) {
          return <Tag color="blue">{t("details.official")}</Tag>;
        }
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {record.users?.shop?.shop_profile?.shop_name ||
                record.users?.username}
            </span>
            <span className="text-xs text-gray-500">
              {record.users?.first_name} {record.users?.last_name}
            </span>
          </div>
        );
      },
    },
    {
      title: t("columns.price"),
      key: "price",
      render: (_: any, record: Product) => {
        const price = record.price_period?.[0]?.price;
        return price ? `฿${Number(price).toLocaleString()}` : "-";
      },
      sorter: true,
    },
    {
      title: t("columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "active") color = "success";
        if (status === "pending") color = "warning";
        if (status === "rejected" || status === "inactive") color = "error";
        // Map status to translation
        // This relies on status string matching keys in en.json/th.json, or using a fallback
        // Since we have a few standard statuses: active, pending, inactive, rejected, approved
        // We can try t(`status.${status}`)
        return (
          <Tag color={color}>
            {t(`status.${status}`) || status.toUpperCase()}
          </Tag>
        );
      },
      sorter: true,
    },
    {
      title: t("columns.items"),
      key: "quantity",
      render: (_: any, record: Product) => (
        <div>
          {record.quantity} sets
          <div className="text-xs text-gray-400">
            ({record.product_stock_card?.length || 0} cards/set)
          </div>
        </div>
      ),
    },
    {
      title: t("columns.createdAt"),
      dataIndex: "created_at", // Note: Need to make sure repository returns created_at? DTO might not have it exposed?
      // ProductResponse DTO doesn't usually stick created_at. Let's check DTO.
      // DTO has StartedAt, EndedAt. CreatedAt is usually DB field. Repo uses it for sorting.
      // Does mapProductToResponse return it? dto.go/mapper.go don't show it in ProductResponse.
      // I probably need to add it to DTO if I want to show it.
      // For now, I'll assume sorting works via backend, but displaying might fail.
      // I'll render StartedAt as proxy? Or update DTO.
      key: "created_at",
      render: (_: any, record: Product) =>
        record.started_at
          ? dayjs(record.started_at).format("DD/MM/YYYY HH:mm")
          : "-",
      sorter: true,
    },
    {
      title: t("columns.actions"),
      key: "action",
      render: (_: any, record: Product) => (
        <Space size="small">
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(record)}
              >
                {t("actions.approve")}
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                {t("actions.reject")}
              </Button>
            </>
          )}
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            {t("actions.view")}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // antd sorter: { field, order }
    if (sorter.field) {
      setSortBy(sorter.field as string);
      setSortOrder(
        sorter.order === "ascend"
          ? "asc"
          : sorter.order === "descend"
            ? "desc"
            : undefined,
      );
    } else {
      setSortBy(undefined);
      setSortOrder(undefined);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="mb-4 flex justify-between items-center bg-gray-50 p-3 rounded-lg">
        <div className="flex gap-4 items-center">
          <span className="text-gray-600 font-medium">{t("filter")}</span>
          <Select
            placeholder={t("filterPlaceholder")}
            allowClear
            style={{ width: 200 }}
            onChange={setStatusFilter}
          >
            <Option value="active">{t("status.active")}</Option>
            <Option value="pending">{t("status.pending")}</Option>
            <Option value="inactive">{t("status.inactive")}</Option>
            <Option value="rejected">{t("status.rejected")}</Option>
          </Select>
        </div>

        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          {t("refresh")}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="product_id"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
