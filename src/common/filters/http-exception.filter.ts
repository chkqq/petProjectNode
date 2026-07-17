import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  error?: string;
  message?: string | string[];
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const normalizedResponse =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ErrorResponseBody)
        : null;

    response.status(statusCode).json({
      statusCode,
      message:
        normalizedResponse?.message ??
        (typeof exceptionResponse === 'string'
          ? exceptionResponse
          : 'Internal server error'),
      error:
        normalizedResponse?.error ??
        (exception instanceof Error ? exception.name : 'InternalServerError'),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
