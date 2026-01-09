export interface User {
  users_id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role_id?: number;
  role?: {
    name: string;
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
