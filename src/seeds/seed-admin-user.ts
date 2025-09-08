import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get<Repository<User>>('UserRepository');
  const roleRepo = app.get<Repository<Role>>('RoleRepository');

  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';

  // Find or create admin role
  const adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
  if (!adminRole) {
    throw new Error(
      'Admin role not found. Please seed roles/permissions first.',
    );
  }

  // Find or create admin user
  let adminUser = await userRepo.findOne({
    where: { email: adminEmail },
    relations: ['roles'],
  });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    adminUser = userRepo.create({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      bio: 'Seeded admin user',
      roles: [adminRole],
    });
    await userRepo.save(adminUser);
    console.log(`Seeded admin user: ${adminEmail} / ${adminPassword}`);
  } else if (!adminUser.roles.some((r) => r.name === 'admin')) {
    adminUser.roles.push(adminRole);
    await userRepo.save(adminUser);
    console.log(`Updated existing user to admin: ${adminEmail}`);
  } else {
    console.log('Admin user already exists and has admin role.');
  }

  await app.close();
}

bootstrap();
