import { Global, Module } from '@nestjs/common';
import { AppConfig } from './app-config';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './database-config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: AppConfig.validationSchema,
    }),
  ],
  providers: [AppConfig, DatabaseConfig],
  exports: [AppConfig, DatabaseConfig],
})
export class AppConfigModule {}
