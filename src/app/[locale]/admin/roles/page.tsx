"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  App,
  Tag,
  Checkbox,
  Input,
  Form,
} from "antd";
import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { adminService, AdminRole, Permission } from "@/services/admin";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";

export default function RolesManagementPage() {
  const t = useTranslations("Admin.Roles");
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  // Edit Permissions Modal State
  const [permModalVisible, setPermModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [checkedPerms, setCheckedPerms] = useState<string[]>([]);

  // Create Role Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  // Queries
  const { data: roles = [], isLoading } = useQuery<AdminRole[]>({
    queryKey: ["admin", "roles"],
    queryFn: adminService.getRoles,
  });

  const { data: allPermissions = [] } = useQuery<Permission[]>({
    queryKey: ["admin", "permissions"],
    queryFn: adminService.getPermissions,
  });

  // Mutations
  const updatePermsMutation = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      adminService.updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      message.success(t("permModal.success"));
      setPermModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
    onError: () => {
      message.error(t("permModal.error"));
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description: string }) =>
      adminService.createRole(name, description),
    onSuccess: () => {
      message.success(t("modal.success"));
      setCreateModalVisible(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
    onError: () => {
      // Handled by Form validation or generic API error
    },
  });

  // Handlers
  const handleEditPerms = (role: AdminRole) => {
    setSelectedRole(role);
    const currentPerms = role.role_permissions
      .map((rp) => rp.permissions?.name)
      .filter((name): name is string => !!name);

    setCheckedPerms(currentPerms);
    setPermModalVisible(true);
  };

  const handleSavePerms = () => {
    if (!selectedRole) return;
    updatePermsMutation.mutate({
      roleId: selectedRole.roles_id,
      permissions: checkedPerms,
    });
  };

  const handleCreateRole = async () => {
    try {
      const values = await createForm.validateFields();
      createRoleMutation.mutate(values);
    } catch (error) {
      // Form validation error
    }
  };

  const columns = [
    {
      title: t("columns.id"),
      dataIndex: "roles_id",
      key: "roles_id",
      width: 80,
    },
    {
      title: t("columns.name"),
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: t("columns.description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("columns.permissions"),
      key: "permissions",
      render: (_: any, record: AdminRole) => (
        <div className="flex flex-wrap gap-1">
          {record.role_permissions.map((rp, idx) =>
            rp.permissions ? (
              <Tag key={idx} className="text-xs">
                {rp.permissions.name}
              </Tag>
            ) : null,
          )}
        </div>
      ),
    },
    {
      title: t("columns.action"),
      key: "action",
      render: (_: any, record: AdminRole) => (
        <Button
          icon={<LockOutlined />}
          size="small"
          onClick={() => handleEditPerms(record)}
        >
          {t("actions.permissions")}
        </Button>
      ),
    },
  ];

  return (
    <ManagementPageLayout 
      title={t("title")}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          {t("create")}
        </Button>
      }
    >
      <Table
        dataSource={roles}
        columns={columns}
        rowKey="roles_id"
        loading={isLoading}
        pagination={false}
      />

      {/* Permissions Modal */}
      <Modal
        title={t("permModal.title", { role: selectedRole?.name || "" })}
        open={permModalVisible}
        onOk={handleSavePerms}
        onCancel={() => setPermModalVisible(false)}
        width={700}
        confirmLoading={updatePermsMutation.isPending}
      >
        <div className="py-4">
          <Checkbox.Group
            className="grid grid-cols-2 gap-2"
            value={checkedPerms}
            onChange={(values) => setCheckedPerms(values as string[])}
          >
            {allPermissions.map((p) => (
              <Checkbox key={p.permissions_id} value={p.name}>
                <div className="flex flex-col">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-gray-500">{p.description}</span>
                </div>
              </Checkbox>
            ))}
          </Checkbox.Group>
        </div>
      </Modal>

      {/* Create Role Modal */}
      <Modal
        title={t("modal.title")}
        open={createModalVisible}
        onOk={handleCreateRole}
        onCancel={() => setCreateModalVisible(false)}
        okText={t("modal.save")}
        cancelText={t("modal.cancel")}
        confirmLoading={createRoleMutation.isPending}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="name"
            label={t("modal.name")}
            rules={[{ required: true }]}
          >
            <Input placeholder={t("modal.namePlaceholder")} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t("modal.description")}
            rules={[{ required: true }]}
          >
            <Input.TextArea placeholder={t("modal.descPlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </ManagementPageLayout>
  );
}
