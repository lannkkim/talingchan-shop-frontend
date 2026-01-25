export interface User {
  users_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  image?: string;
  role_id?: string;
  role?: {
    name: string;
    description?: string;
    roles_id?: string;
  };
  is_active?: boolean;
  permissions?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}
