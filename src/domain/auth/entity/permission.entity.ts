import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';

@Entity()
export class Permission extends CoreEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  permissionId!: string;

  @Property()
  actionCode!: string;

  @Property()
  resource!: string;
}
