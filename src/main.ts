import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './logger/logging.interceptor';
import { LoggerService } from './logger/logger.service';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filter/global-exception.filter';
import { AppConfig } from './config/app-config';
import { SwaggerModule } from '@nestjs/swagger';
import { createDocumentBuilder, swaggerCustomOptions } from './config/swagger-config';
import { AppException } from './common/exception/app.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const orm = app.get(MikroORM);
  const generator = orm.getSchemaGenerator();
  // 개발 환경에서만 실행
  if (process.env.NODE_ENV === 'development') {
    await generator.updateSchema({ dropTables: false });
  }

  const loggerService = app.get(LoggerService);
  const appConfig = app.get(AppConfig);

  app.useGlobalFilters(new GlobalExceptionFilter(loggerService, appConfig));

  // 유효성 검증 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors) => {
        // 검증 오류를 필드별로 정리
        const formattedErrors = validationErrors.reduce((acc, error) => {
          acc[error.property] = Object.values(error.constraints || {});
          return acc;
        }, {});
        // AppException으로 변환 (INVALID_INPUT 에러 코드 사용)
        return new AppException('INVALID_INPUT', {
          message: '입력값이 유효하지 않습니다',
          details: formattedErrors,
        });
      },
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor(loggerService), new TransformInterceptor(appConfig));

  const document = SwaggerModule.createDocument(
    app,
    createDocumentBuilder({ apiVersion: appConfig.apiVersion, appName: appConfig.appName }),
  );

  SwaggerModule.setup('api-docs', app, document, swaggerCustomOptions);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
