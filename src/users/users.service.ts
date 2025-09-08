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
}
