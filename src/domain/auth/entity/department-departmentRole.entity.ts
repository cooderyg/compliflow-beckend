import { Entity, ManyToOne } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Department } from 'src/domain/department/entity/department.entity';
import { DepartmentRole } from './department-role.entity';

@Entity()
export class DepartmentDepartmentRole extends CoreEntity {
  @ManyToOne({ primary: true })
  department!: Department;

  @ManyToOne({ primary: true })
  departmentRole!: DepartmentRole;
}
