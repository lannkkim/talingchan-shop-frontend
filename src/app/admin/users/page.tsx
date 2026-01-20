"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Select, message, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { adminService, AdminUser, AdminRole } from "@/services/admin";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

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
      message.error("Failed to fetch data");
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
      message.success("User role updated");
      setModalVisible(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      message.error("Failed to update role");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "users_id",
      key: "users_id",
      width: 80,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Full Name",
      key: "fullname",
      render: (_: any, record: AdminUser) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: ["role", "name"],
      key: "role",
      render: (roleName: string) => (
        <Tag color={roleName === "admin" ? "red" : roleName === "shop" ? "green" : "blue"}>
          {roleName ? roleName.toUpperCase() : "USER"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: AdminUser) => (
        <Button icon={<EditOutlined />} size="small" onClick={() => handleEditRole(record)}>
          Edit Role
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="users_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`Edit Role: ${selectedUser?.username}`}
        open={modalVisible}
        onOk={handleSaveRole}
        onCancel={() => setModalVisible(false)}
      >
         <div className="py-4">
             <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
             <Select
                className="w-full"
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                options={roles.map(r => ({ label: r.name, value: r.roles_id }))}
             />
         </div>
      </Modal>
    </div>
  );
}
