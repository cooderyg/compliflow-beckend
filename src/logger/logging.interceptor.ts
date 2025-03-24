import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 비 HTTP 요청이면 바로 실행
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // 헬스체크 요청은 로깅하지 않음
    if (request.url === '/') {
      return next.handle();
    }

    // 요청 ID는 미들웨어에서 이미 설정됨
    const requestId = request.requestId as string;

    // 컨트롤러 정보
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const controllerPath = `${controllerName}.${handlerName}`;

    // 요청 정보
    const { method, url } = request;

    // 컨트롤러 실행 시작 시간
    const startTime = Date.now();

    // 컨트롤러 실행 시작 로깅 - 기본 정보만 로깅
    this.logger.log(`Controller ${controllerPath} - Executing`, controllerPath, requestId);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;

          // 성공적인 응답 로깅 - 상세 데이터 없이 기본 정보만 로깅
          this.logger.log(
            `Controller ${controllerPath} - Completed ${response.statusCode} - ${duration}ms`,
            controllerPath,
            requestId,
          );

          // 비즈니스 로직 성능 측정 (300ms 초과만)
          if (duration > 300 && duration <= 1000) {
            this.logger.logPerformance(controllerPath, duration, { method, url }, requestId);
          }
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;

          // 에러 발생 시에는 요청 데이터만 로깅 (응답 데이터는 에러이므로 불필요)
          const { body, query, params } = request;

          // 에러에서 추출할 정보
          const errorInfo = {
            message: error?.message,
            name: error?.name,
            // NestJS 예외는 종종 statusCode와 errorCode를 가짐
            statusCode: (error as any)?.statusCode,
            errorCode: (error as any)?.errorCode || (error as any)?.code,
          };

          this.logger.error(
            `Controller ${controllerPath} - Error: ${error.message}`,
            error.stack,
            controllerPath,
            requestId,
            {
              duration,
              error: errorInfo,
              // 디버깅을 위한 요청 데이터 로깅
              requestData: {
                body: this.prepareDataForLogging(body),
                query,
                params,
              },
            },
          );
        },
      }),
    );
  }

  // 민감 데이터 필터링 및 중첩 배열 처리 로직
  private prepareDataForLogging(data: any): any {
    if (!data) return data;

    // 깊은 복사로 원본 데이터와의 참조 관계 완전히 끊기
    let loggingData;

    try {
      loggingData = JSON.parse(JSON.stringify(data));
    } catch (e) {
      loggingData = { serialization_error: true };
      return loggingData;
    }

    // 민감한 필드 리스트
    const sensitiveFields = ['userPassword', 'userNm', 'userEmail', 'accessToken'];

    // 중첩된 data 객체 및 최상위 필드 검사
    this.redactSensitiveFields(loggingData, sensitiveFields);

    return loggingData;
  }

  // 민감 필드 제거 헬퍼 메서드
  private redactSensitiveFields(obj: any, sensitiveFields: string[]): void {
    if (!obj || typeof obj !== 'object') return;

    // 최상위 필드 검사
    sensitiveFields.forEach((field) => {
      if (obj[field]) obj[field] = '[REDACTED]';
    });

    // 중첩된 data 객체 검사
    if (obj.data && typeof obj.data === 'object') {
      sensitiveFields.forEach((field) => {
        if (obj.data[field]) obj.data[field] = '[REDACTED]';
      });
    }
  }
}
