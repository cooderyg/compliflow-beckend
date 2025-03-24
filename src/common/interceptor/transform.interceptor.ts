import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';
import { AppConfig } from 'src/config/app-config';

export interface StandardResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: number;
    path: string;
    version: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly appConfig: AppConfig) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const isProduction = this.appConfig.nodeEnv === 'production';

    return next.handle().pipe(
      map((data) => {
        // 컨트롤러에서 data와 pagination을 분리해서 전달한 경우
        let responseData = data;
        let pagination = undefined;

        // 컨트롤러에서 { data, pagination } 형태로 반환한 경우 처리
        if (data && typeof data === 'object' && 'data' in data && 'pagination' in data) {
          responseData = data.data;
          pagination = data.pagination;
        }

        // 기본 메타 정보
        const meta: any = {
          timestamp: Date.now(),
          version: request.apiVersion,
        };

        // 프로덕션 환경이 아닌 경우에만 path 추가
        if (!isProduction) {
          meta.path = request.url;
        }

        // 페이지네이션 정보가 있으면 추가
        if (pagination) {
          meta.pagination = pagination;
        }

        // 응답 생성
        const response: StandardResponse<any> = {
          success: true,
          meta: meta,
        };

        // null이나 undefined가 아닌 경우에만 data 필드 추가
        if (responseData !== null && responseData !== undefined) {
          response.data = responseData;
        }

        return response;
      }),
    );
  }
}
