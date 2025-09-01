import { Injectable, NotFoundException } from '@nestjs/common';
import { handleDatabaseError } from '../common/utils/handle-database-error';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      return await this.userRepository.save(user);
    } catch (error) {
      handleDatabaseError(error, 'create user');
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      return user ?? undefined;
    } catch (error) {
      handleDatabaseError(error, 'fetch user by email');
    }
  }

  async findOneById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      handleDatabaseError(error, 'fetch user by id');
    }
  }
}
