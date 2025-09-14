import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), AuthModule, UsersModule],
  providers: [RbacService, PermissionsGuard],
  controllers: [RbacController],
  exports: [PermissionsGuard],
})
export class RbacModule {}
