import { Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { AppConfig } from './app-config';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ACTIVE_ONLY, NOT_DELETED } from 'src/common/const';

@Injectable()
export class DatabaseConfig {
  constructor(private readonly appConfig: AppConfig) {}

  getDatabaseConfig(): Options {
    const commonConfig = {
      entities: ['./dist/**/*.entity.js'], // 컴파일된 엔티티 위치
      entitiesTs: ['./src/**/*.entity.ts'], // TypeScript 소스 엔티티 위치
      metadataProvider: TsMorphMetadataProvider,
      migrations: {
        path: join(process.cwd(), 'dist/database/migration'),
        pathTs: join(process.cwd(), 'src/database/migration'),
        glob: '!(*.d).{js,ts}',
      },
      seeder: {
        path: join(process.cwd(), 'dist/database/seeder'),
        pathTs: join(process.cwd(), 'src/database/seeder'),
        glob: '!(*.d).{js,ts}',
      },
      driver: PostgreSqlDriver,
      filters: {
        [NOT_DELETED]: {
          cond: { isDeleted: false },
          default: true,
        },
        [ACTIVE_ONLY]: {
          cond: { status: 'active' },
          default: false,
        },
      },
    };

    const nodeEnv = this.appConfig.nodeEnv;

    switch (nodeEnv) {
      case 'production':
        return {
          ...commonConfig,
          host: this.appConfig.database.host,
          port: this.appConfig.database.port,
          user: this.appConfig.database.username,
          password: this.appConfig.database.password,
          dbName: this.appConfig.database.name,
          debug: false,
          driverOptions: {
            connection: {
              ssl: {
                rejectUnauthorized: false, // SSL 설정 (필요한 경우)
              },
            },
          },
          pool: { min: 2, max: 10 }, // 커넥션 풀 설정
        };
      case 'staging':
        return {
          ...commonConfig,
          host: this.appConfig.database.host,
          port: this.appConfig.database.port,
          user: this.appConfig.database.username,
          password: this.appConfig.database.password,
          dbName: this.appConfig.database.name,
          debug: false,
          pool: { min: 1, max: 5 },
        };
      default: // 'development'
        return {
          ...commonConfig,
          host: this.appConfig.database.host,
          port: this.appConfig.database.port,
          user: this.appConfig.database.username,
          password: this.appConfig.database.password,
          dbName: this.appConfig.database.name,
          debug: true,
          // SQL 구문 하이라이팅 (개발 환경에서만 사용)
          highlighter: new SqlHighlighter(),
          allowGlobalContext: true, // 개발 환경에서만 허용
        };
    }
  }
}
