import { Entity, ManyToOne } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Permission } from './permission.entity';
import { DepartmentRole } from './department-role.entity';

@Entity()
export class DepartmentRolePermission extends CoreEntity {
  @ManyToOne({ primary: true })
  departmentRole!: DepartmentRole;

  @ManyToOne({ primary: true })
  permission!: Permission;
}
