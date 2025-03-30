import { Collection, Entity, Index, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CoreEntity } from 'src/common/entity/core.entity';
import { TenantUser } from 'src/domain/tanant/entity/tenant-user.entity';

export enum UserStatus {
  Active = 'active', //활성 (Active) - 정상적으로 사용 중인 계정
  Dormant = 'dormant', // 휴면 (Dormant) - 일정 기간 동안 로그인이나 활동이 없는 계정
  Suspended = 'suspended', // 정지 (Suspended) - 임시적으로 접근이 제한된 계정
  Restricted = 'restricted', // 제한 (Restricted) - 일부 기능만 사용 가능한 상태
  Locked = 'locked', // 잠금 (Locked) - 보안상의 이유로 일시적으로 잠긴 상태
  PendingDeletion = 'pending_deleion', //삭제 예정 (Pending Deletion) - 삭제가 예정되어 있지만 아직 완전히 삭제되지 않은 상태
  Deleted = 'deleted', // 사용자 데이터가 삭제된 상태
  Blocked = 'blocked', // 차단됨 (Blocked) - 이용 약관 위반 등으로 차단된 상태
  VerificationRequired = 'verification_required', // 검증 필요 (Verification Required) - 이메일/전화번호 등의 추가 인증이 필요한 상태
}

@Entity()
export class User extends CoreEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  userId!: string;

  @Property()
  email!: string;

  @Property()
  password!: string;

  @Property()
  status!: UserStatus;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property({ nullable: true })
  lastLoginAt?: Date;

  @Property({ default: false })
  isMfaEnabled: boolean;

  @OneToMany(() => TenantUser, (tu) => tu.user)
  tenantUsers = new Collection<TenantUser>(this);

  @Property({ nullable: true })
  deletedAt?: Date;

  @Index()
  @Property({ default: false })
  isDeleted!: boolean;
}
