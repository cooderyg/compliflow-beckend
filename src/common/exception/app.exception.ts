// src/common/exceptions/app.exception.ts
import { HttpException } from '@nestjs/common';
import { errorCodes, ErrorKey } from './error-code';

export interface AppExceptionOptions {
  message?: string;
  subCode?: string;
  details?: any;
  meta?: Record<string, any>;
}

export class AppException extends HttpException {
  readonly code: number;
  readonly errorKey: ErrorKey;
  readonly subCode?: number;
  readonly details?: any;
  readonly userFriendly: boolean;

  constructor(errorKey: ErrorKey, options?: AppExceptionOptions) {
    const errorDef = errorCodes[errorKey];
    const message = options?.message || errorDef.message;

    super(message, errorDef.httpStatus);

    this.errorKey = errorKey;
    this.code = errorDef.code;
    this.userFriendly = errorDef.userFriendly || false;
    this.details = options?.details;

    // 서브코드 처리
    if (options?.subCode && errorDef.subCodes && errorDef.subCodes[options.subCode]) {
      this.subCode = errorDef.subCodes[options.subCode];
    }
  }
}
