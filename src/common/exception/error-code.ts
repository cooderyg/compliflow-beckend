// 에러 카테고리 정의
export enum ErrorCategory {
  GENERAL = 1000, // 일반 오류
  AUTH = 2000, // 인증 관련 오류
  VALIDATION = 3000, // 입력값 검증 오류
  RESOURCE = 4000, // 리소스 관련 오류
  BUSINESS = 5000, // 비즈니스 로직 오류
  EXTERNAL = 6000, // 외부 서비스 오류
  INTERNAL = 9000, // 내부 서버 오류
}

// 에러 정의 인터페이스
export interface ErrorDefinition {
  code: number;
  message: string;
  httpStatus: number;
  logging?: boolean;
  userFriendly?: boolean;
  subCodes?: Record<string, number>;
}

// 에러 키 타입 정의
export type ErrorKey =
  // 인증 관련 에러
  | 'UNAUTHORIZED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN'

  // 검증 관련 에러
  | 'INVALID_INPUT'
  | 'INVALID_PARAM'

  // 리소스 관련 에러
  | 'RESOURCE_NOT_FOUND'
  | 'DUPLICATE_ENTRY'

  // 비즈니스 로직 에러
  | 'INSUFFICIENT_FUNDS'
  | 'PAYMENT_FAILED'
  | 'ORDER_ALREADY_PROCESSED'
  | 'PRODUCT_OUT_OF_STOCK'
  | 'USER_QUOTA_EXCEEDED'
  | 'SUBSCRIPTION_REQUIRED'
  | 'INVALID_COUPON'
  | 'INVALID_TRANSACTION'

  // 외부 서비스 에러
  | 'EXTERNAL_API_ERROR'
  | 'DATABASE_ERROR'

  // 서버 관련 에러
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

export const errorCodes: Record<ErrorKey, ErrorDefinition> = {
  // 인증 관련 에러
  UNAUTHORIZED: {
    code: ErrorCategory.AUTH + 1,
    message: '인증이 필요합니다',
    httpStatus: 401,
    logging: false,
    userFriendly: true,
  },
  TOKEN_EXPIRED: {
    code: ErrorCategory.AUTH + 2,
    message: '인증이 만료되었습니다',
    httpStatus: 401,
    logging: true,
    userFriendly: true,
  },
  FORBIDDEN: {
    code: ErrorCategory.AUTH + 3,
    message: '접근 권한이 없습니다',
    httpStatus: 403,
    logging: true,
    userFriendly: true,
  },

  // 검증 관련 에러
  INVALID_INPUT: {
    code: ErrorCategory.VALIDATION + 1,
    message: '입력값이 유효하지 않습니다',
    httpStatus: 400,
    logging: false,
    userFriendly: true,
  },
  INVALID_PARAM: {
    code: ErrorCategory.VALIDATION + 2,
    message: '파라미터가 유효하지 않습니다',
    httpStatus: 400,
    logging: false,
    userFriendly: true,
  },

  // 리소스 관련 에러
  RESOURCE_NOT_FOUND: {
    code: ErrorCategory.RESOURCE + 1,
    message: '요청한 리소스를 찾을 수 없습니다',
    httpStatus: 404,
    logging: false,
    userFriendly: true,
  },
  DUPLICATE_ENTRY: {
    code: ErrorCategory.RESOURCE + 2,
    message: '이미 존재하는 항목입니다',
    httpStatus: 409,
    logging: true,
    userFriendly: true,
  },

  // 비즈니스 로직 에러
  INSUFFICIENT_FUNDS: {
    code: ErrorCategory.BUSINESS + 1,
    message: '잔액이 부족합니다',
    httpStatus: 400,
    logging: true,
    userFriendly: true,
    subCodes: {
      BALANCE_ZERO: 1,
      BELOW_MINIMUM: 2,
      DAILY_LIMIT_EXCEEDED: 3,
      PENDING_TRANSACTIONS: 4,
    },
  },
  PAYMENT_FAILED: {
    code: ErrorCategory.BUSINESS + 2,
    message: '결제에 실패했습니다',
    httpStatus: 400,
    logging: true,
    userFriendly: true,
    subCodes: {
      CARD_DECLINED: 1,
      INVALID_CARD: 2,
      EXPIRED_CARD: 3,
      INSUFFICIENT_CARD_BALANCE: 4,
      PAYMENT_GATEWAY_ERROR: 5,
    },
  },
  ORDER_ALREADY_PROCESSED: {
    code: ErrorCategory.BUSINESS + 3,
    message: '이미 처리된 주문입니다',
    httpStatus: 400,
    logging: false,
    userFriendly: true,
    subCodes: {
      ALREADY_PAID: 1,
      ALREADY_SHIPPED: 2,
      ALREADY_CANCELLED: 3,
      ALREADY_REFUNDED: 4,
    },
  },

  // 외부 서비스 에러
  EXTERNAL_API_ERROR: {
    code: ErrorCategory.EXTERNAL + 1,
    message: '외부 서비스 연동 중 오류가 발생했습니다',
    httpStatus: 502,
    logging: true,
    userFriendly: false,
  },
  DATABASE_ERROR: {
    code: ErrorCategory.EXTERNAL + 2,
    message: '데이터베이스 오류가 발생했습니다',
    httpStatus: 500,
    logging: true,
    userFriendly: false,
  },

  // 서버 관련 에러
  SERVER_ERROR: {
    code: ErrorCategory.INTERNAL + 1,
    message: '서버 오류가 발생했습니다',
    httpStatus: 500,
    logging: true,
    userFriendly: true,
  },
  SERVICE_UNAVAILABLE: {
    code: ErrorCategory.INTERNAL + 2,
    message: '서비스를 일시적으로 사용할 수 없습니다',
    httpStatus: 503,
    logging: true,
    userFriendly: true,
  },

  PRODUCT_OUT_OF_STOCK: undefined,
  USER_QUOTA_EXCEEDED: undefined,
  SUBSCRIPTION_REQUIRED: undefined,
  INVALID_COUPON: undefined,
  INVALID_TRANSACTION: undefined,
};
