import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';
    let code = 'DATABASE_ERROR';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists';
        code = 'UNIQUE_CONSTRAINT';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced record does not exist';
        code = 'FOREIGN_KEY_ERROR';
        break;
      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = 'Required relation violation';
        code = 'RELATION_ERROR';
        break;
      case 'P2016':
        status = HttpStatus.BAD_REQUEST;
        message = 'Query interpretation error';
        code = 'QUERY_ERROR';
        break;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
