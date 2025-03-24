import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';

// 에러 스키마
export class ErrorResponse {
  @ApiProperty({ example: 'ERR_001' })
  code: string;

  @ApiProperty({ example: '오류가 발생했습니다.' })
  message: string;

  @ApiPropertyOptional({ example: { field: 'name', issue: 'required' } })
  details?: any;
}

// 페이지네이션 메타 스키마
export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

// 메타 스키마
export class ResponseMeta {
  @ApiProperty({ example: 1616161616161 })
  timestamp: number;

  @ApiProperty({ example: '/api/path' })
  path: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiPropertyOptional({ type: PaginationMeta })
  pagination?: PaginationMeta;
}

// StandardResponse를 위한 Swagger 데코레이터
export const ApiStandardResponse = <T extends Type<any>>(model?: T) => {
  if (model) {
    // 데이터가 있는 성공 응답
    return applyDecorators(
      ApiOkResponse({
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: getSchemaPath(model) },
            error: { $ref: getSchemaPath(ErrorResponse), nullable: true },
            meta: { $ref: getSchemaPath(ResponseMeta) },
          },
        },
      }),
    );
  } else {
    // 데이터가 없는 성공 응답
    return applyDecorators(
      ApiOkResponse({
        schema: {
          properties: {
            success: { type: 'boolean', example: true },
            error: { $ref: getSchemaPath(ErrorResponse), nullable: true },
            meta: { $ref: getSchemaPath(ResponseMeta) },
          },
        },
      }),
    );
  }
};
