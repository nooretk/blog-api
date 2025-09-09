import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { PERMISSIONS, ROLES } from '../common/constants/permissions-and-roles';

async function attachPermissionsToRole(
  roleName: string,
  permissions: Permission[],
  roleRepo: Repository<Role>,
) {
  const role = await roleRepo.findOne({
    where: { name: roleName },
    relations: ['permissions'],
  });
  if (role) {
    role.permissions = permissions;
    await roleRepo.save(role);
  } else {
    console.error(`Role not found: ${roleName}`);
  }
}

async function bootstrap() {
  const userPermissionNames = [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST_OWN,
    PERMISSIONS.DELETE_POST_OWN,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.EDIT_COMMENT_OWN,
    PERMISSIONS.DELETE_COMMENT_OWN,
    PERMISSIONS.UPDATE_PROFILE_OWN,
    PERMISSIONS.VIEW_POSTS,
  ];

  const adminPermissionNames = [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.DELETE_POST_ANY,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.DELETE_COMMENT_ANY,
    PERMISSIONS.ASSIGN_ROLE,
    PERMISSIONS.UPDATE_PROFILE_OWN,
    PERMISSIONS.EDIT_POST_OWN,
    PERMISSIONS.EDIT_COMMENT_OWN,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_POSTS,
  ];

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const permissionRepo = app.get<Repository<Permission>>(
      'PermissionRepository',
    );
    const roleRepo = app.get<Repository<Role>>('RoleRepository');

    console.log('Seeding permissions...');
    const permissionsData = Object.values(PERMISSIONS).map((name) => ({
      name,
      description: `Can ${name.replace(/_/g, ' ').toLowerCase()}`,
    }));
    await permissionRepo.upsert(permissionsData, ['name']);

    console.log('Seeding roles...');
    await roleRepo.upsert(
      [
        {
          name: ROLES.ADMIN,
          description: 'Administrator',
        },
        {
          name: ROLES.USER,
          description: 'Normal user',
        },
      ],
      ['name'],
    );

    console.log('Attaching permissions to roles...');
    const adminPermissions = await permissionRepo.find({
      where: adminPermissionNames.map((name) => ({ name })),
    });
    await attachPermissionsToRole(ROLES.ADMIN, adminPermissions, roleRepo);

    const userPermissions = await permissionRepo.find({
      where: userPermissionNames.map((name) => ({ name })),
    });
    await attachPermissionsToRole(ROLES.USER, userPermissions, roleRepo);

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
