import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfig } from './config/app-config';
import { AppConfigModule } from './config/app-config.module';
import { LoggingMiddleware } from './logger/logging.middleware';
import { LoggerModule } from './logger/logger.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DatabaseConfig } from './config/database-config';
import { UserModule } from './domain/user/user.module';

@Module({
  imports: [
    AppConfigModule,
    MikroOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (databaseConfig: DatabaseConfig) => databaseConfig.getDatabaseConfig(),
      inject: [DatabaseConfig],
    }),
    LoggerModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppConfig],
  exports: [AppConfig],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
