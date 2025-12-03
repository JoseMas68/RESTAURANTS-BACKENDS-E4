import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from '@common/common.module';
import { DatabaseModule } from '@database/database.module';
import { TransformResponseInterceptor } from '@common/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { RestaurantsModule } from '@modules/restaurants/restaurants.module';
import { MenusModule } from '@modules/menus/menus.module';
import { MenuItemsModule } from '@modules/menu-items/menu-items.module';
import { BookingsModule } from '@modules/bookings/bookings.module';
import { ReviewsModule } from '@modules/reviews/reviews.module';
import { UsersModule } from '@modules/users/users.module';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    DatabaseModule,
    RestaurantsModule,
    MenusModule,
    MenuItemsModule,
    BookingsModule,
    ReviewsModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
