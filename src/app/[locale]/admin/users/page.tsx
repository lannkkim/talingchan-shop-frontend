"use client";

import React, { useState } from "react";
import { Table, Button, Modal, Select, App } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { adminService, AdminUser, AdminRole } from "@/services/admin";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import { StatusTag } from "@/components/shared/StatusTag";

export default function UsersManagementPage() {
  const t = useTranslations("Admin.Users");
  const { message: messageApi } = App.useApp();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: adminService.getUsers,
  });

  const { data: roles = [] } = useQuery<AdminRole[]>({
    queryKey: ["admin", "roles"],
    queryFn: adminService.getRoles,
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      adminService.updateUserRole(userId, roleId),
    onSuccess: () => {
      messageApi.success(t("modal.success"));
      setModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => {
      console.error(error);
      messageApi.error(t("modal.error"));
    },
  });

  const handleEditRole = (user: AdminUser) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role?.roles_id || null);
    setModalVisible(true);
  };

  const handleSaveRole = () => {
    if (!selectedUser || !selectedRoleId) return;
    updateRoleMutation.mutate({
      userId: selectedUser.users_id,
      roleId: selectedRoleId,
    });
  };

  const columns = [
    {
      title: t("columns.id"),
      dataIndex: "users_id",
      key: "users_id",
      width: 80,
    },
    {
      title: t("columns.username"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("columns.fullname"),
      key: "fullname",
      render: (_: any, record: AdminUser) =>
        `${record.first_name} ${record.last_name}`,
    },
    {
      title: t("columns.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("columns.role"),
      dataIndex: ["role", "name"],
      key: "role",
      render: (roleName: string) => (
        <StatusTag domain="user_role" status={roleName || "user"} />
      ),
    },
    {
      title: t("columns.action"),
      key: "action",
      render: (_: any, record: AdminUser) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          onClick={() => handleEditRole(record)}
        >
          {t("actions.editRole")}
        </Button>
      ),
    },
  ];

  return (
    <ManagementPageLayout title={t("title")}>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="users_id"
        loading={usersLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={t("modal.title", { username: selectedUser?.username || "" })}
        open={modalVisible}
        onOk={handleSaveRole}
        onCancel={() => setModalVisible(false)}
        okText={t("modal.save")}
        cancelText={t("modal.cancel")}
        confirmLoading={updateRoleMutation.isPending}
      >
        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("modal.selectRole")}
          </label>
          <Select
            className="w-full"
            value={selectedRoleId}
            onChange={setSelectedRoleId}
            options={roles.map((r) => ({ label: r.name, value: r.roles_id }))}
          />
        </div>
      </Modal>
    </ManagementPageLayout>
  );
}
