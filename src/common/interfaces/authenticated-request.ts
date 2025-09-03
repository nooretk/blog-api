import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    name: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    roles: Array<{
      id: number;
      name: string;
      description?: string;
      permissions: Array<{
        id: number;
        name: string;
        description?: string;
      }>;
    }>;
  };
}
