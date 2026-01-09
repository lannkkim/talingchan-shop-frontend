import axiosInstance from "@/lib/axios";

export interface AdminUser {
  users_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    roles_id: number;
    name: string;
  } | null;
}

export interface AdminRole {
  roles_id: number;
  name: string;
  description: string;
  role_permissions: {
    permissions: {
      name: string;
    } | null;
  }[];
}

export interface Permission {
  permissions_id: number;
  name: string;
  description: string;
}

export const adminService = {
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await axiosInstance.get("/api/v1/auth/admin/users");
    return response.data;
  },

  updateUserRole: async (userId: number, roleId: number) => {
    await axiosInstance.put(`/api/v1/auth/admin/users/${userId}/role`, {
      role_id: roleId,
    });
  },

  getRoles: async (): Promise<AdminRole[]> => {
    const response = await axiosInstance.get("/api/v1/auth/admin/roles");
    return response.data;
  },

  createRole: async (name: string, description: string) => {
    // Re-using existing endpoint or admin endpoint?
    // Admin endpoint doesn't exist for create role in my backend impl yet?
    // Ah, `ctrl.CreateRole` exists and is mapped to `/api/v1/auth/roles`.
    // Let's use that.
    const response = await axiosInstance.post("/api/v1/auth/roles", {
      name,
      description,
    });
    return response.data;
  },

  getPermissions: async (): Promise<Permission[]> => {
    const response = await axiosInstance.get("/api/v1/auth/admin/permissions");
    return response.data;
  },

  updateRolePermissions: async (roleId: number, permissions: string[]) => {
    await axiosInstance.put(`/api/v1/auth/admin/roles/${roleId}/permissions`, {
      permissions,
    });
  },
};
