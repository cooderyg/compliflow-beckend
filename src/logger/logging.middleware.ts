import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';
import { v4 as uuidv4 } from 'uuid';
import { AppConfig } from 'src/config/app-config';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: LoggerService,
    private readonly appConfig: AppConfig,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // 헬스체크 요청 필터링
    if (this.isHealthCheck(req)) {
      next();
      return;
    }

    // apiVersion 설정
    req.apiVersion = this.appConfig.apiVersion;

    // 요청 ID 설정
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent');
    const startTime = Date.now();

    // HTTP 요청 시작 로깅 (기본 메타데이터만)
    this.logger.log(`HTTP ${method} ${originalUrl} - Started`, 'HttpRequest', requestId, {
      ip,
      userAgent,
    });

    // 응답 완료 이벤트 로깅
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // 오류 응답만 로깅 (성공 응답은 인터셉터에서 처리)
      if (statusCode >= 500) {
        this.logger.error(
          `HTTP ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
          null,
          'HttpError',
          requestId,
        );
      } else if (statusCode >= 400) {
        this.logger.warn(`HTTP ${method} ${originalUrl} - ${statusCode} - ${duration}ms`, 'HttpWarning', requestId);
      }

      // 매우 느린 HTTP 응답만 여기서 로깅
      if (duration > 1000) {
        this.logger.logPerformance('HTTP Request', duration, { method, url: originalUrl, statusCode }, requestId);
      }
    });

    next();
  }

  private isHealthCheck(req: Request): boolean {
    const { originalUrl, method } = req;
    const userAgent = req.get('user-agent');
    return originalUrl === '/' && method === 'GET' && userAgent === 'ELB-HealthChecker/2.0';
  }
}
