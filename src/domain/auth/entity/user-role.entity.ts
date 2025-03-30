import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';
import { UserRolePermission } from './userRole-permission.entity';
import { Tenant } from 'src/domain/tanant/entity/tenant.entity';
import { TenantUserUserRole } from './tenantUser-userRole.entity';

@Entity()
export class UserRole extends CoreEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  roleId!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @ManyToOne()
  tenant!: Tenant;

  @OneToMany(() => UserRolePermission, (rp) => rp.userRole)
  userRolePermissions = new Collection<UserRolePermission>(this);

  @OneToMany(() => TenantUserUserRole, (tur) => tur.userRole)
  tenantUserUserRoles = new Collection<TenantUserUserRole>(this);
}
