import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class PostgresExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 23505: Unique constraint violation (e.g., duplicate email)
    if (exception.code === '23505') {
      let customMessage = 'This email already exists.';
      if (exception.detail && exception.detail.includes('email')) {
        customMessage = 'This email already exists.';
      } else {
        customMessage = 'A record with this value already exists.';
      }

      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: customMessage,
        error: 'Conflict',
      });
    }

    // 23503: Foreign key constraint violation
    if (exception.code === '23503') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.detail || 'Referenced record does not exist',
        error: 'Bad Request',
      });
    }

    // Standard NestJS HTTP Exceptions (e.g., ValidationPipe, Throttler, Unauthorized)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      let message: any = exception.message;
      let error = exception.name.replace('Exception', '');

      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || message;
        error = resObj.error || error;
      } else if (typeof res === 'string') {
        message = res;
      }

      return response.status(status).json({
        statusCode: status,
        message,
        error,
      });
    }

    // Unhandled 500 errors - prevent internal stack traces from leaking
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}