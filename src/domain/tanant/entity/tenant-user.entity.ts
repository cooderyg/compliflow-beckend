import { Collection, Entity, Index, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/domain/user/entity/user.entity';
import { Tenant } from './tenant.entity';
import { TenantUserUserRole } from 'src/domain/auth/entity/tenantUser-userRole.entity';

export enum TenantUserStatus {
  Active = 'active', //활성 (Active) - 정상적으로 사용 중인 계정
  Suspended = 'suspended', // 정지 (Suspended) - 임시적으로 접근이 제한된 계정
  Restricted = 'restricted', // 제한 (Restricted) - 일부 기능만 사용 가능한 상태
  Locked = 'locked', // 잠금 (Locked) - 보안상의 이유로 일시적으로 잠긴 상태
  PendingDeletion = 'pending_deletion', //삭제 예정 (Pending Deletion) - 삭제가 예정되어 있지만 아직 완전히 삭제되지 않은 상태
  Deleted = 'deleted', // 사용자 데이터가 삭제된 상태
  Blocked = 'blocked', // 차단됨 (Blocked) - 이용 약관 위반 등으로 차단된 상태
}

@Entity()
export class TenantUser extends CoreEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  tenantUserId!: string;

  @ManyToOne()
  tenant!: Tenant;

  @ManyToOne()
  user!: User;

  @Property()
  status!: TenantUserStatus;

  @Property({ nullable: true })
  deletedAt?: Date;

  @Index()
  @Property({ default: false })
  isDeleted!: boolean;

  @OneToMany(() => TenantUserUserRole, (tur) => tur.tenantUser)
  tenantUserUserRoles = new Collection<TenantUserUserRole>(this);
}
