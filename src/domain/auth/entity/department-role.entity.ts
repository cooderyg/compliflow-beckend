import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Tenant } from 'src/domain/tanant/entity/tenant.entity';
import { DepartmentDepartmentRole } from './department-departmentRole.entity';
import { DepartmentRolePermission } from './departmentRole-permission.entity';

@Entity()
export class DepartmentRole extends CoreEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  departmentRoleId!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property()
  isSystemDefined!: boolean;

  @Property()
  isCustom!: boolean;

  @ManyToOne()
  tenant!: Tenant;

  @OneToMany(() => DepartmentRolePermission, (drp) => drp.departmentRole)
  departmentRolePermissions = new Collection<DepartmentRolePermission>(this);

  @OneToMany(() => DepartmentDepartmentRole, (ddr) => ddr.departmentRole)
  departmentDepartmentRoles = new Collection<DepartmentDepartmentRole>(this);
}
