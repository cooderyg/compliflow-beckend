import { Property } from '@mikro-orm/core';

export abstract class CoreEntity {
  @Property()
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
