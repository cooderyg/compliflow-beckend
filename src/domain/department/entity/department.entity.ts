import { Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';
import { DepartmentDepartmentRole } from 'src/domain/auth/entity/department-departmentRole.entity';
import { Tenant } from 'src/domain/tanant/entity/tenant.entity';

@Entity()
export class Department extends CoreEntity {
  @Property()
  name!: string;

  @ManyToOne()
  tenant!: Tenant;

  @OneToMany(() => DepartmentDepartmentRole, (ddr) => ddr.department)
  departmentDepartmentRoles = new Collection<DepartmentDepartmentRole>(this);
}
