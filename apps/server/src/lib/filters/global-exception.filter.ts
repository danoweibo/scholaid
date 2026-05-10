import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';

/**
 * Catches every exception thrown in the app and returns a consistent
 * JSON error shape:
 *
 * {
 *   statusCode: number,
 *   message:    string | string[],
 *   error:      string,
 *   timestamp:  string,
 *   path:       string
 * }
 *
 * - HttpExceptions (thrown by NestJS guards, pipes, or manually) are forwarded
 *   as-is with their status code and message.
 * - Unknown errors (unhandled throws, DB crashes, etc.) are returned as 500
 *   with a generic message — the real error is logged server-side only so
 *   stack traces never reach the client.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<{ url: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'An unexpected error occurred.';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const r = response as Record<string, unknown>;
        message = (r.message as string | string[]) ?? message;
        error = (r.error as string) ?? exception.name;
      }
    } else {
      // Unknown error — log it fully server-side, return nothing useful to client
      this.logger.error(
        `Unhandled exception on ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    void reply.status(status).send({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
