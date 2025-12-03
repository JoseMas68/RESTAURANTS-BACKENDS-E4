import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseShape<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  pagination?: Record<string, unknown>;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ResponseShape<T>> {
  intercept(_: ExecutionContext, next: CallHandler): Observable<ResponseShape<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ResponseShape<T>;
        }

        return {
          success: true,
          data,
        } as ResponseShape<T>;
      }),
    );
  }
}
