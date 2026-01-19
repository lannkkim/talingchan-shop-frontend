"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  message,
  Tag,
  Checkbox,
  Input,
  Form,
} from "antd";
import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { adminService, AdminRole, Permission } from "@/services/admin";
import { useTranslations } from "next-intl";

export default function RolesManagementPage() {
  const t = useTranslations("Admin.Roles");
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Permissions Modal
  const [permModalVisible, setPermModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [checkedPerms, setCheckedPerms] = useState<string[]>([]);

  // Create Role Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permsData] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions(),
      ]);
      setRoles(rolesData);
      setAllPermissions(permsData);
    } catch (error) {
      console.error(error);
      message.error(t("permModal.error")); // General fetch error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Edit Permissions
  const handleEditPerms = (role: AdminRole) => {
    setSelectedRole(role);
    // Parse existing permissions
    const currentPerms = role.role_permissions
      .map((rp) => rp.permissions?.name)
      .filter((name): name is string => !!name);

    setCheckedPerms(currentPerms);
    setPermModalVisible(true);
  };

  const handleSavePerms = async () => {
    if (!selectedRole) return;
    try {
      await adminService.updateRolePermissions(
        selectedRole.roles_id,
        checkedPerms,
      );
      message.success(t("permModal.success"));
      setPermModalVisible(false);
      fetchData();
    } catch (error) {
      message.error(t("permModal.error"));
    }
  };

  // Handle Create Role
  const handleCreateRole = async () => {
    try {
      const values = await createForm.validateFields();
      await adminService.createRole(values.name, values.description);
      message.success(t("modal.success"));
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchData();
    } catch (error) {
      // Form validation error or API error
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("title")}</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          {t("create")}
        </Button>
      </div>

      <Table
        dataSource={roles}
        columns={columns}
        rowKey="roles_id"
        loading={loading}
        pagination={false}
      />

      {/* Permissions Modal */}
      <Modal
        title={t("permModal.title", { role: selectedRole?.name || "" })}
        open={permModalVisible}
        onOk={handleSavePerms}
        onCancel={() => setPermModalVisible(false)}
        width={700}
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
        cancelText={
          t("modal.save").replace("Create", "Cancel") === t("modal.save")
            ? "Cancel"
            : "Cancel"
        } // Fallback logic
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
    </div>
  );
}
