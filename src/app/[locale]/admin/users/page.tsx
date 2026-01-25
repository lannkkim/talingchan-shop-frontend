"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Select, message, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { adminService, AdminUser, AdminRole } from "@/services/admin";
import { useTranslations } from "next-intl";

export default function UsersManagementPage() {
  const t = useTranslations("Admin.Users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        adminService.getUsers(),
        adminService.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error(error);
      message.error(t("modal.error")); // Or general error? Using modal error for fetch specific is weird but okay for now.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditRole = (user: AdminUser) => {
    setSelectedUser(user);
    setSelectedRoleId(user.role?.roles_id || null);
    setModalVisible(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !selectedRoleId) return;
    try {
      await adminService.updateUserRole(selectedUser.users_id, selectedRoleId);
      message.success(t("modal.success"));
      setModalVisible(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      message.error(t("modal.error"));
    }
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
        <Tag
          color={
            roleName === "admin"
              ? "red"
              : roleName === "shop"
                ? "green"
                : "blue"
          }
        >
          {roleName ? roleName.toUpperCase() : "USER"}
        </Tag>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("title")}</h1>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="users_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={t("modal.title", { username: selectedUser?.username || "" })}
        open={modalVisible}
        onOk={handleSaveRole}
        onCancel={() => setModalVisible(false)}
        okText={t("modal.save")}
        cancelText={t("modal.cancel")}
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
    </div>
  );
}
