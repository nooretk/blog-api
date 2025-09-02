import { Request } from 'express';
import { AuthenticatedUser } from '../../admin/interfaces/authenticated-user.interface';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
