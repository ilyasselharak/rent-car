import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message: string | string[] }).message ||
          'An error occurred';

    const errorResponse = {
      success: false,
      statusCode: status,
      code:
        exception instanceof HttpException
          ? `HTTP_${status}`
          : 'INTERNAL_ERROR',
      message: Array.isArray(message) ? message[0] : message,
      details: typeof exceptionResponse === 'object' && 'errors' in exceptionResponse
        ? (exceptionResponse as { errors: unknown }).errors
        : undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
