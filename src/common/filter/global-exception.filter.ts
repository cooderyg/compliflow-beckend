import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { StandardResponse } from '../interceptor/transform.interceptor';
import { LoggerService } from 'src/logger/logger.service';
import { AppException } from '../exception/app.exception';
import { errorCodes } from '../exception/error-code';
import { AppConfig } from 'src/config/app-config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly appConfig: AppConfig,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = this.getHttpStatus(exception);
    const requestId = request?.requestId;
    const path = request?.url;

    // 표준 응답 객체 생성
    const errorResponse: StandardResponse<unknown> = {
      success: false,
      error: this.extractErrorDetails(exception),
      meta: {
        timestamp: Date.now(),
        path: path,
        version: this.appConfig.apiVersion,
      },
    };

    // 로깅 메타데이터 준비
    const logMeta = {
      status,
      path,
      method: request?.method,
      ip: request?.ip,
      userAgent: request?.headers?.['user-agent'],
    };

    // 예외 유형별 적절한 로깅
    if (exception instanceof AppException) {
      const errorKey = exception.errorKey;
      const errorDef = errorCodes[errorKey];

      if (errorDef?.logging !== false) {
        // 명시적으로 false인 경우만 로깅 제외
        const logMessage = `Business exception: [${errorKey}${exception.subCode ? ':' + exception.subCode : ''}] ${exception.message || 'No message'}`;
        const logContext = 'BusinessException';
        const metaData = {
          ...logMeta,
          code: exception.code,
          subCode: exception.subCode,
          details: exception.details,
          errorKey: errorKey,
        };

        if (status >= 500) {
          this.loggerService.error(logMessage, exception.stack || 'No stack trace', logContext, requestId, metaData);
        } else {
          this.loggerService.warn(logMessage, logContext, requestId, metaData);
        }
      }
    } else {
      // 예상치 못한 예외는 에러 수준으로 로깅
      this.loggerService.error(
        `Unhandled exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
        'UnhandledException',
        requestId,
        logMeta,
      );
    }

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof AppException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractErrorDetails(exception: unknown): any {
    try {
      // 1. AppException 처리
      if (exception instanceof AppException) {
        const errorResponse: any = {
          code: exception.code || 'UNKNOWN_ERROR_CODE',
          message: exception.message || 'Unknown error occurred',
        };
        // subCode가 있으면 포함
        if (exception.subCode) {
          errorResponse.subCode = exception.subCode;
        }
        // 개발 환경이거나 사용자에게 보여줄 수 있는 정보면 상세 정보 포함
        if (this.appConfig.nodeEnv === 'development' || exception.userFriendly) {
          if (exception.details) {
            errorResponse.details = exception.details;
          }
        }

        return errorResponse;
      }
    } catch (error) {
      console.error('Error in extractErrorDetails:', error);
      // 에러 추출 중 오류 발생 시 기본 에러 응답
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing the error details',
      };
    }

    // 4. 예상치 못한 예외 처리
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        this.appConfig.nodeEnv === 'production'
          ? 'Internal server error'
          : exception instanceof Error
            ? exception.message || 'Unknown error'
            : 'Unknown error',
    };
  }
}
