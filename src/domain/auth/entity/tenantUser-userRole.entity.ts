import { Entity, ManyToOne } from '@mikro-orm/core';
import { TenantUser } from 'src/domain/tanant/entity/tenant-user.entity';
import { UserRole } from './user-role.entity';

@Entity()
export class TenantUserUserRole {
  @ManyToOne({ primary: true })
  tenantUser!: TenantUser;

  @ManyToOne({ primary: true })
  userRole!: UserRole;
}
