// 요청 객체 확장을 위한 타입 정의
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      apiVersion?: string;
    }
  }
}

// 로깅 메타데이터 타입
export interface LogMetadata {
  [key: string]: any;
}

// 비즈니스 이벤트 로깅 데이터 타입
export interface BusinessEventData {
  [key: string]: any;
}

// 성능 로깅 메타데이터 타입
export interface PerformanceMetadata {
  [key: string]: any;
}
