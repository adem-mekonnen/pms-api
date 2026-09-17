// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { randomUUID } from 'crypto';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
  };
  correlationId: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();

    // Grab tracking ID from header or make a fresh one
    const correlationId =
      (request.headers['x-correlation-id'] as string) || randomUUID();

    // Wrap the response in our official box!
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
        },
        correlationId,
      })),
    );
  }
}