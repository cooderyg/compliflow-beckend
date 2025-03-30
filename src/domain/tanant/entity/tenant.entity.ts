import { Collection, Entity, Index, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';
import { TenantUser } from './tenant-user.entity';
import { UserRole } from 'src/domain/auth/entity/user-role.entity';
import { Department } from 'src/domain/department/entity/department.entity';

export enum TenantTier {
  free = 'free',
}

@Entity()
export class Tenant extends CoreEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  tenantId!: string;

  @Property()
  name!: string;

  @Property({ default: TenantTier.free })
  tenantTier!: TenantTier;

  @OneToMany(() => TenantUser, (tu) => tu.tenant)
  tenantUsers = new Collection<TenantUser>(this);

  @OneToMany(() => UserRole, (r) => r.tenant)
  userRoles = new Collection<UserRole>(this);

  @OneToMany(() => Department, (d) => d.tenant)
  departments = new Collection<Department>(this);

  @Property({ nullable: true })
  deletedAt?: Date;

  @Index()
  @Property({ default: false })
  isDeleted!: boolean;
}
