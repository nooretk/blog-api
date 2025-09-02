export interface UserRole {
  id: number;
  name: string;
  description: string;
  permissions: UserPermission[];
}

export interface UserPermission {
  id: number;
  name: string;
  description: string;
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  bio?: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}
