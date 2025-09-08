import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly dataSource: DataSource,
  ) {}

  private handleError(error: unknown, operation: string): never {
    if (error instanceof Error) {
      this.logger.error(`${operation} failed`, error.stack);
    } else {
      this.logger.error(`${operation} failed`, String(error));
    }

    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    throw new InternalServerErrorException(`Failed to ${operation}`);
  }

  async assignRole(userId: number, roleName: string): Promise<User> {
    return this.modifyUserRole(userId, roleName, 'assign');
  }

  async revokeRole(userId: number, roleName: string): Promise<User> {
    return this.modifyUserRole(userId, roleName, 'revoke');
  }

  private async modifyUserRole(
    userId: number,
    roleName: string,
    action: 'assign' | 'revoke',
  ): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['roles'],
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      const role = await queryRunner.manager.findOne(Role, {
        where: { name: roleName },
      });
      if (!role) {
        throw new NotFoundException(`Role '${roleName}' not found`);
      }
      const hasRole = user.roles.some((r) => r.name === roleName);
      if (action === 'assign') {
        if (hasRole) {
          throw new BadRequestException(
            `User already has the '${roleName}' role`,
          );
        }
        user.roles.push(role);
      } else if (action === 'revoke') {
        if (!hasRole) {
          throw new BadRequestException(
            `User does not have the '${roleName}' role`,
          );
        }
        user.roles = user.roles.filter((r) => r.name !== roleName);
      }
      const savedUser = await queryRunner.manager.save(User, user);
      await queryRunner.commitTransaction();
      this.logger.log(
        `Role '${roleName}' ${action === 'assign' ? 'assigned to' : 'revoked from'} user ${userId}`,
      );
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError(
        error,
        `${action} role '${roleName}' ${action === 'assign' ? 'to' : 'from'} user ${userId}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
