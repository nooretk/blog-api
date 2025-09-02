import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), AuthModule, UsersModule],
  providers: [AdminService, PermissionsGuard],
  controllers: [AdminController],
  exports: [PermissionsGuard],
})
export class AdminModule {}
