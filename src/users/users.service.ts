import { Injectable, NotFoundException } from '@nestjs/common';
import { handleDatabaseError } from '../common/utils/handle-database-error';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
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
}
