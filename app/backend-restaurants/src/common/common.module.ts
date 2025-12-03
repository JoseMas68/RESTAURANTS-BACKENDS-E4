import { Global, Module } from '@nestjs/common';
import { TransformResponseInterceptor } from './interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Global()
@Module({
  providers: [TransformResponseInterceptor, HttpExceptionFilter],
  exports: [TransformResponseInterceptor, HttpExceptionFilter],
})
export class CommonModule {}
