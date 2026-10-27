import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import escapeHtml from 'escape-html';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let error: string | string[] = 'Internal Server Error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (status === HttpStatus.NOT_FOUND) {
        message = 'Resource not found';
        error = 'Not Found';
      } else if (typeof exceptionResponse === 'string') {
        message = this.sanitizeMessage(exceptionResponse);
        error = 'Error';
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = this.sanitizeMessage(responseObj.message || message);
        error = this.sanitizeMessage(responseObj.error || 'Error');
      }
    } else {
      const dbErr = exception as any;
      if (dbErr?.driverError?.number === 2627 || dbErr?.driverError?.number === 2601) {
        status = HttpStatus.CONFLICT;
        message = 'A record with this identifier or name already exists.';
        error = 'Conflict';
      } else {
        console.error('Unhandled Exception Caught by Filter:', exception);
      }
    }

    if (response.headersSent) {
      return response.end();
    }

    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');

    response.status(status).json({
      statusCode: status,
      error: error,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }

  private sanitizeMessage(message: string | string[]): string | string[] {
    if (Array.isArray(message)) {
      return message.map((msg) => this.sanitizeString(msg));
    }
    return this.sanitizeString(message);
  }

  private sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return String(str);
    }
    return escapeHtml(str);
  }
}
