import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'admin' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Administrator role' })
  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({ name: 'role_permissions' })
  permissions: Permission[];
}
