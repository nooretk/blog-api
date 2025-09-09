import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { handleDatabaseError } from '../common/utils/handle-database-error';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { ListUsersDto } from './dto/list-users.dto';
import { PaginatedUsersResponseDto } from './dto/user-list-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async createUser(data: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      bio: data.bio,
    });
    try {
      // Assign the 'user' role by default
      const userRole = await this.roleRepository.findOne({
        where: { name: 'user' },
      });
      if (!userRole) {
        throw new NotFoundException(
          "Default 'user' role not found. Please check system configuration.",
        );
      }
      user.roles = [userRole];
      const savedUser = await this.userRepository.save(user);
      delete (savedUser as Partial<User>).password; // it's uncesseary since we already use @Exclude, but for extra security and avoid exposing mistakes or logging
      return savedUser;
    } catch (error) {
      handleDatabaseError(error, 'create user');
    }
  }

  async findByEmailForAuth(email: string): Promise<User | undefined> {
    try {
      // Specifically for authentication - includes password
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'name', 'bio', 'createdAt', 'password'], // Explicitly include password
      });
      return user ?? undefined;
    } catch (error) {
      handleDatabaseError(error, 'fetch user by email for authentication');
    }
  }

  /**
   * Find user by ID specifically for authentication in AuthGuard
   * Returns only fields needed for creating SafeUser object
   */
  async findOneById(id: number): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'email', 'name', 'bio', 'createdAt'], // Only auth-required fields
        relations: ['roles', 'roles.permissions'],
      });
      return user;
    } catch (error) {
      handleDatabaseError(error, 'fetch user for authentication');
      return null;
    }
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Only update fields that are provided
      if (dto.name !== undefined) {
        user.name = dto.name;
      }
      if (dto.bio !== undefined) {
        user.bio = dto.bio;
      }

      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      handleDatabaseError(error, 'update user profile');
    }
  }

  async updatePassword(
    userId: number,
    dto: UpdatePasswordDto,
  ): Promise<{ message: string; updatedAt: Date }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'password', 'updatedAt'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Prevent updating to the same password
      const isSamePassword = await bcrypt.compare(
        dto.newPassword,
        user.password,
      );
      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from the current password',
        );
      }

      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

      user.password = hashedPassword;

      const updatedUser = await this.userRepository.save(user);
      delete (updatedUser as Partial<User>).password; // it's uncesseary since we already use @Exclude, but for extra security and avoid exposing mistakes or logging

      return {
        message: 'Password updated successfully',
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      handleDatabaseError(error, 'update user password');
    }
  }

  async findAllUsers(
    listUsersDto: ListUsersDto,
  ): Promise<PaginatedUsersResponseDto> {
    try {
      const { page = 1, limit = 10, search } = listUsersDto;
      const offset = (page - 1) * limit;

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.bio',
          'user.createdAt',
          'user.updatedAt',
          'roles.id',
          'roles.name',
          'roles.description',
        ]);

      if (search) {
        queryBuilder.where(
          '(user.name ILIKE :search OR user.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      queryBuilder.orderBy('user.createdAt', 'DESC').skip(offset).take(limit);

      const [users, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit) || 1;

      // Validate that the requested page is within bounds
      if (total > 0 && page > totalPages) {
        throw new NotFoundException(
          `Page ${page} not found. Total pages available: ${totalPages}`,
        );
      }

      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          roles: user.roles.map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description,
          })),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Handle technical database errors
      handleDatabaseError(error, 'fetch users list');
    }
  }
}
