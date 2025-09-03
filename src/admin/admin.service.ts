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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate user exists
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['roles'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // 2. Validate role exists
      const role = await queryRunner.manager.findOne(Role, {
        where: { name: roleName },
      });

      if (!role) {
        throw new NotFoundException(`Role '${roleName}' not found`);
      }

      // 3. Check if user already has role
      if (user.roles.some((r) => r.name === roleName)) {
        throw new BadRequestException(
          `User already has the '${roleName}' role`,
        );
      }

      // 4. Assign role
      user.roles.push(role);
      const savedUser = await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();

      this.logger.log(`Role '${roleName}' assigned to user ${userId}`);
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError(error, `assign role '${roleName}' to user ${userId}`);
    } finally {
      await queryRunner.release();
    }
  }

  async revokeRole(userId: number, roleName: string) {
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

      // Check if user has the role before attempting removal
      const hasRole = user.roles.some((role) => role.name === roleName);
      if (!hasRole) {
        throw new BadRequestException(
          `User does not have the '${roleName}' role`,
        );
      }

      // Remove the role
      user.roles = user.roles.filter((r) => r.name !== roleName);

      const savedUser = await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();

      this.logger.log(`Role '${roleName}' revoked from user ${userId}`);
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError(error, `revoke role '${roleName}' from user ${userId}`);
    } finally {
      await queryRunner.release();
    }
  }
}
