import { Entity, ManyToOne } from '@mikro-orm/core';
import { UserRole } from './user-role.entity';
import { Permission } from './permission.entity';

@Entity()
export class UserRolePermission {
  @ManyToOne({ primary: true })
  userRole!: UserRole;

  @ManyToOne({ primary: true })
  permission!: Permission;
}
