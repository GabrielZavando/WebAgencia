import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse = {
      error: 'Internal Server Error',
      message: 'Ocurrió un error inesperado',
      statusCode: status,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        errorResponse = {
          error: (responseObj['error'] as string) || this.getErrorName(status),
          message: (responseObj['message'] as string) || exception.message,
          statusCode: status,
        };
      } else {
        errorResponse = {
          error: this.getErrorName(status),
          message: exception.message,
          statusCode: status,
        };
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
      errorResponse = {
        error: 'Internal Server Error',
        message: 'Ocurrió un error inesperado',
        statusCode: status,
      };
    }

    response.status(status).json(errorResponse);
  }

  private getErrorName(status: number): string {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return errorNames[status] || 'Error';
  }
}
