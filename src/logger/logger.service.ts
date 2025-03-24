import { Injectable, LogLevel, LoggerService as NestLoggerService } from '@nestjs/common';
import { AppConfig } from 'src/config/app-config';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { BusinessEventData, LogMetadata, PerformanceMetadata } from './tpye/logger.type';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private readonly appConfig: AppConfig) {
    const isProd = this.appConfig.nodeEnv !== 'dev';

    // 공통 포맷
    const commonFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      winston.format.errors({ stack: true }),
    );

    // 개발 환경용 콘솔 포맷 (로컬 개발 시)
    const devConsoleFormat = winston.format.combine(
      commonFormat,
      winston.format.colorize(),
      nestWinstonModuleUtilities.format.nestLike('APP', {
        prettyPrint: true,
        colors: true,
      }),
    );

    // 프로덕션 환경용 JSON 포맷 (CloudWatch 등에 적합)
    const prodConsoleFormat = winston.format.combine(commonFormat, winston.format.json());

    // 환경에 따라 포맷 선택
    const consoleFormat = isProd ? prodConsoleFormat : devConsoleFormat;

    // 민감 정보 필터링 로직
    const sensitiveDataFilter = winston.format((info) => {
      const filteredInfo = { ...info };
      if (filteredInfo.password) filteredInfo.password = '[REDACTED]';
      if (filteredInfo.creditCard) filteredInfo.creditCard = '[REDACTED]';
      if (filteredInfo.token) filteredInfo.token = '[REDACTED]';
      return filteredInfo;
    });

    // 트랜스포트 설정
    const transports: winston.transport[] = [
      // 항상 콘솔 로그 사용
      new winston.transports.Console({
        level: isProd ? 'info' : 'debug',
        format: consoleFormat,
      }),
    ];

    // 로거 인스턴스 생성
    this.logger = winston.createLogger({
      level: isProd ? 'info' : 'debug',
      defaultMeta: {
        service: this.appConfig.appName,
        environment: this.appConfig.nodeEnv,
      },
      format: winston.format.combine(sensitiveDataFilter(), winston.format.json()),
      transports,
    });
  }

  // 요청 ID를 포함한 로깅 메소드
  private logWithRequestId(
    level: string,
    message: string,
    context?: string,
    requestId?: string,
    meta?: LogMetadata,
  ): void {
    const logData: LogMetadata = {
      message,
      context: context || 'Application',
      ...(requestId && { requestId }),
      ...(meta && { meta }),
    };
    this.logger[level](message, logData);
  }

  // NestJS LoggerService 인터페이스 구현
  log(message: any, context?: string, requestId?: string, meta?: LogMetadata): void {
    this.logWithRequestId('info', message, context, requestId, meta);
  }

  error(message: any, trace?: string, context?: string, requestId?: string, meta?: LogMetadata): void {
    this.logWithRequestId('error', message, context, requestId, {
      ...meta,
      trace,
    });
  }

  warn(message: any, context?: string, requestId?: string, meta?: LogMetadata): void {
    this.logWithRequestId('warn', message, context, requestId, meta);
  }

  debug(message: any, context?: string, requestId?: string, meta?: LogMetadata): void {
    this.logWithRequestId('debug', message, context, requestId, meta);
  }

  verbose(message: any, context?: string, requestId?: string, meta?: LogMetadata): void {
    this.logWithRequestId('verbose', message, context, requestId, meta);
  }

  // 추가 메서드 - NestJS LoggerService 인터페이스에 포함되지 않음
  // 비즈니스 이벤트 로깅용 메소드
  logBusinessEvent(eventName: string, data: BusinessEventData, requestId?: string): void {
    this.log(`Business Event: ${eventName}`, 'BusinessEvent', requestId, data);
  }

  // 성능 로깅용 메소드
  logPerformance(operation: string, durationMs: number, metadata?: PerformanceMetadata, requestId?: string): void {
    const level = durationMs > 1000 ? 'warn' : 'debug';
    this.logWithRequestId(level, `Operation ${operation} took ${durationMs}ms`, 'Performance', requestId, {
      operation,
      durationMs,
      ...metadata,
    });
  }

  // LogLevel[] 설정 (NestJS 인터페이스 호환성)
  setLogLevels?(levels: LogLevel[]): void {
    // Winston은 직접적으로 NestJS LogLevel 배열을 지원하지 않으므로
    // 이 메서드가 호출되면 경고를 출력하고 무시
    console.warn('setLogLevels is not fully implemented with Winston');
  }
}
