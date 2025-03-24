import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';

@Entity()
export class User extends CoreEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  userId!: string;

  @Property()
  email!: string;

  @Property()
  password!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  deletedAt?: Date;

  @Index()
  @Property({ default: false })
  isDeleted!: boolean;
}
